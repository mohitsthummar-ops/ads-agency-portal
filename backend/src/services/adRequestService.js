const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdRequest = require('../models/AdRequest');
const UserSubscription = require('../models/UserSubscription');
const GeneratedImage = require('../models/GeneratedImage');
const { logActivity } = require('../utils/logger');

/**
 * Generate AI Image for an ad request.
 */
const generateAIImage = async (requestId, userId) => {
    const request = await AdRequest.findOne({ _id: requestId, user: userId });
    if (!request) throw new Error('Campaign request not found');
    if (request.status !== 'approved' && request.status !== 'completed') {
        throw new Error('Admin must approve this request before generating an image');
    }

    const userSub = await UserSubscription.findOne({ user: userId, status: 'active' }).populate('plan');
    if (!userSub) {
        throw new Error('Please purchase a subscription to generate images');
    }
    if (new Date() > new Date(userSub.expiryDate)) {
        userSub.status = 'expired';
        await userSub.save();
        throw new Error('Your subscription has expired. Please renew to continue.');
    }
    if (userSub.usage.imagesGenerated >= userSub.plan.imageGenerationLimit) {
        throw new Error('Image generation limit reached for your current plan. Please upgrade.');
    }

    const title = request.title || 'Brand Advertisement';
    const brand = request.businessName || 'Business';
    const description = request.description || '';

    let styleKeywords = 'Modern, minimal, elegant (not cluttered)';
    const lowerDesc = description.toLowerCase();
    const lowerBrand = brand.toLowerCase();

    if (lowerDesc.includes('food') || lowerBrand.includes('bakery') || lowerBrand.includes('cafe')) {
        styleKeywords = 'delicious food photography, warm lighting, restaurant ad poster, modern, clean';
    } else if (lowerDesc.includes('fashion') || lowerDesc.includes('clothing') || lowerBrand.includes('boutique')) {
        styleKeywords = 'trendy fashion models, urban style, instagram aesthetic, high-end editorial';
    } else if (lowerDesc.includes('tech') || lowerDesc.includes('software')) {
        styleKeywords = 'futuristic design, neon glow, minimal tech branding, premium tech showcase';
    } else if (lowerDesc.includes('gym') || lowerDesc.includes('workout') || lowerBrand.includes('gym')) {
        styleKeywords = 'strong athletes, dark cinematic lighting, motivational poster, high contrast';
    }

    const finalPrompt = `Create a premium, modern advertisement poster.
Business Name: ${brand}
Campaign Title: ${title}
Description: ${description}

Design Requirements:
- Show "${brand}" prominently
- Add a bold headline: "${title}"
- Professional advertisement layout, clean background
- Visual Style: Ultra-realistic, 3D modern design, bright lighting, ${styleKeywords}

Negative Prompt: blurry, distorted text, low quality, watermark`;

    const seed = Math.floor(Math.random() * 1000000);
    let backgroundBuffer = null;
    let finalImageUrl = '';

    console.log(`[Ad Gen] Exact Prompt used:\n${finalPrompt}`);

    try {
        if (process.env.NVIDIA_API_KEY) {
            const response = await axios.post("https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell", {
                text_prompts: [{ text: finalPrompt }],
                seed: seed
            }, {
                headers: { "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`, "Content-Type": "application/json" },
                timeout: 60000
            });
            if (response.data?.artifacts?.[0]?.base64) {
                backgroundBuffer = Buffer.from(response.data.artifacts[0].base64, 'base64');
            }
        } else if (process.env.TOGETHER_API_KEY) {
            const response = await axios.post("https://api.together.xyz/v1/images/generations", {
                model: "black-forest-labs/FLUX.1-schnell",
                prompt: finalPrompt,
                width: 1024, height: 1024, steps: 28, n: 1, response_format: "b64_json"
            }, {
                headers: { "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`, "Content-Type": "application/json" },
                timeout: 60000
            });
            if (response.data?.data?.[0]?.b64_json) {
                backgroundBuffer = Buffer.from(response.data.data[0].b64_json, 'base64');
            }
        }

        if (!backgroundBuffer) {
            const encodedPrompt = encodeURIComponent(finalPrompt.substring(0, 1500));
            const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;
            const response = await fetch(pollinationsUrl, { signal: AbortSignal.timeout(45000) });
            if (response.ok) {
                const arrBuf = await response.arrayBuffer();
                backgroundBuffer = Buffer.from(arrBuf);
            }
        }
    } catch (e) {
        console.error(`[Ad Gen] Image generation error:`, e.message);
    }

    if (!backgroundBuffer) {
        const placeholderUrl = `https://placehold.co/1024x1024/4f46e5/ffffff/png?text=${encodeURIComponent(brand)}`;
        try {
            const response = await fetch(placeholderUrl);
            if (response.ok) backgroundBuffer = Buffer.from(await response.arrayBuffer());
        } catch (e) { }
    }

    if (backgroundBuffer) {
        const filename = `ad-${request._id}-${Date.now()}.jpg`;
        const uploadDir = path.resolve(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, backgroundBuffer);
        finalImageUrl = `/uploads/${filename}`;
    } else {
        throw new Error('Failed to generate image');
    }

    userSub.usage.imagesGenerated += 1;
    await userSub.save();

    const genImage = await GeneratedImage.create({
        user: userId,
        adRequest: request._id,
        imageUrl: finalImageUrl,
        promptUsed: finalPrompt,
    });

    request.generatedImages.push(genImage._id);
    request.status = 'approved';
    await request.save();

    logActivity(userId, `generated AI image for ad request ${request._id}`);

    return {
        imageUrl: finalImageUrl,
        imagesUsed: userSub.usage.imagesGenerated
    };
};

module.exports = {
    generateAIImage,
};
