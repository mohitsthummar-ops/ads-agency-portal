# 🚀 Ads Agency Portal — AI-Powered SaaS Platform

A full-stack **MERN** (MongoDB, Express, React, Node.js) SaaS application for managing advertisement campaigns with AI-generated images, subscription billing via Razorpay, and a dual admin/client dashboard.

---

## ✨ Features

### 👤 Client Side
- Register / Login (Manual + Google OAuth)
- Subscription Management (Demo & Pro plans via Razorpay)
- Submit Ad Campaign Requests
- AI Image Generation for approved requests (Pollinations AI / Gemini)
- View & manage all campaign history
- Profile Settings & Password Reset (Email OTP)

### 🛡️ Admin Side
- Dashboard with real-time analytics & revenue stats
- User Management (block / delete)
- Ad Request Approval with image generation control
- Category & Platform management
- Transaction History

### 🔐 Security
- JWT-based authentication with HTTP-only cookies
- Rate limiting on all API routes
- Helmet for secure HTTP headers
- MongoDB sanitization to prevent NoSQL injection
- HTTPS-ready CORS configuration

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TailwindCSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT, Passport.js, Google OAuth 2.0 |
| Payments | Razorpay |
| AI | Google Gemini, Pollinations AI |
| Email | Nodemailer (Gmail SMTP) |

---

## 📂 Project Structure

```
ads-agency-portal/
├── backend/
│   ├── src/
│   │   ├── config/       # DB, Passport
│   │   ├── controllers/  # Route logic
│   │   ├── middleware/   # Auth, error handler
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # Express routers
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Logger, mailer, async handler
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/   # Layout, common UI
    │   ├── pages/        # Public, Auth, Client, Admin
    │   ├── services/     # Axios API calls
    │   ├── store/        # Zustand auth store
    │   └── App.jsx
    └── package.json
```

---

## ⚙️ Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/mohitsthummar-ops/ads-agency-portal.git
cd ads-agency-portal
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (MongoDB, JWT, Razorpay, Gemini, SMTP, Google OAuth)
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Seed the Database (optional)
```bash
cd backend
node src/seed.js
```
This creates sample users, subscription plans, categories, platforms, campaigns, and ads.

**Default credentials after seeding:**
| Role | Email | Password |
|---|---|---|
| Admin | admin@gmail.com | admin123 |
| Client | client@gmail.com | client123 |

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory. See `.env.example` for the full list.

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ad_agency
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
GEMINI_API_KEY=your_gemini_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:3000
```

---

## 📸 Subscription Plans

| Plan | Price | Ads | AI Images | Duration |
|---|---|---|---|---|
| Demo | Free | 5 | 10 | 7 days |
| Pro | ₹99 | 50 | 100 | 30 days |

---

## 📜 License

MIT License — free to use and modify.

---

> Built with ❤️ by [Mohit Thummar](https://github.com/mohitsthummar-ops)
