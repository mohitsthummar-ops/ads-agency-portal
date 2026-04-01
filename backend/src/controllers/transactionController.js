const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { getRazorpayInstance, handleSubscriptionPayment, validateWebhookSignature } = require('../services/transactionService');
const { logActivity } = require('../utils/logger');

// ─── @route   POST /api/transactions/create-order ────────────────────────────
exports.createOrder = asyncHandler(async (req, res) => {
    const { amount, purpose, description, metadata } = req.body;
    if (!amount || amount < 1) {
        return sendError(res, 400, 'Valid amount is required');
    }

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // paise
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: { purpose, userId: req.user.id, description, ...metadata },
    });

    // Save pending transaction
    await Transaction.create({
        user: req.user.id,
        razorpayOrderId: order.id,
        amount,
        currency: 'INR',
        purpose,
        status: 'created',
        metadata: { description, ...metadata },
    });

    sendSuccess(res, 201, 'Order created', { order, key: process.env.RAZORPAY_KEY_ID });
});

// ─── @route   POST /api/transactions/verify ───────────────────────────────────
exports.verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        logActivity(req.user.id, 'failed payment verification (invalid signature)', 'failure');
        return sendError(res, 400, 'Payment verification failed: invalid signature');
    }

    const transaction = await Transaction.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: 'paid',
        },
        { new: true }
    );

    if (!transaction) return sendError(res, 404, 'Transaction not found');

    if (transaction.purpose === 'subscription') {
        const packageId = transaction.metadata?.packageId;
        await handleSubscriptionPayment(transaction.user, packageId);
    }

    logActivity(req.user.id, `payment verified successfully for order ${razorpay_order_id}`);
    sendSuccess(res, 200, 'Payment verified successfully', { transaction });
});

// ─── @route   POST /api/transactions/webhook ─────────────────────────────────
exports.razorpayWebhook = asyncHandler(async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
        const signature = req.headers['x-razorpay-signature'];
        const bodyStr = JSON.stringify(req.body);

        if (!validateWebhookSignature(bodyStr, signature, webhookSecret)) {
            return sendError(res, 400, 'Invalid webhook signature');
        }
    }

    const { event, payload } = req.body;
    if (event === 'payment.captured') {
        const orderId = payload?.payment?.entity?.order_id;
        const paymentId = payload?.payment?.entity?.id;

        if (orderId) {
            const transaction = await Transaction.findOneAndUpdate(
                { razorpayOrderId: orderId },
                { razorpayPaymentId: paymentId, status: 'paid', webhookData: payload },
                { new: true }
            );

            if (transaction && transaction.purpose === 'subscription') {
                const packageId = transaction.metadata?.packageId;
                await handleSubscriptionPayment(transaction.user, packageId);
            }
        }
    }
    sendSuccess(res, 200, 'Webhook processed successfully');
});

// ─── @route   GET /api/transactions [User's own] ─────────────────────────────
exports.getUserTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({ user: req.user.id })
        .sort('-createdAt')
        .lean();
    sendSuccess(res, 200, 'Transactions fetched successfully', { transactions });
});
