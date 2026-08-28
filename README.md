# 🔐 PassSaver — Modern & Secure Password Manager

<div align="center">

![PassSaver Banner](https://github.com/user-attachments/assets/f9c8c871-ea05-4761-b716-3083316c5908)

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**PassSaver** is a full-stack, secure password manager built with **React**, **Node.js/Express**, and **MongoDB**. It features **passwordless Google Gmail OTP authentication**, instant cloud syncing across devices, password breach checking, and PDF export capabilities.

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Environment Setup](#-environment-variables) • [Deployment](#-deployment-guide)

</div>

---

## ✨ Key Features

- 🔑 **Google Gmail OTP Authentication**: Secure passwordless login and sign-up using 6-digit one-time codes delivered directly to your Gmail inbox via SMTP.
- ☁️ **MongoDB Cloud Database**: Passwords are saved in the cloud and strictly partitioned by authenticated user IDs.
- ⚡ **Offline / Guest Mode Support**: Allows local management via browser `localStorage` when offline, with automatic cloud sync on login.
- 🎲 **Built-in Password Generator**: Quickly generate randomized, high-entropy passwords with one click.
- 📋 **One-Click Copy & Show/Hide**: Copy credentials to your clipboard with visual feedback or toggle password visibility.
- 📄 **Export to PDF**: Generate structured, styled PDF reports of your saved credentials on demand using `jsPDF` and `jspdf-autotable`.
- 🛡️ **Pwned Password Verification**: Built-in integration with HaveIBeenPwned to check whether your passwords were compromised in known data breaches.
- 📱 **Fully Responsive UI**: Clean, responsive, and mobile-friendly design built with Tailwind CSS.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React & Lordicon
- **PDF Generation**: `jspdf` & `jspdf-autotable`
- **Notifications**: `react-toastify`

### Backend
- **Runtime**: Node.js & Express
- **Database**: MongoDB (via Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT) & Nodemailer (Gmail SMTP)
- **Environment**: Dotenv

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or free MongoDB Atlas account)

### 2. Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/Sunnysines/passop.git
cd passop

# Install all project dependencies (frontend & backend)
npm install
```

### 3. Configure Environment Variables
Copy the example environment file:
```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and configure your credentials:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/passop
JWT_SECRET=your_super_secret_jwt_key_here

# Optional: Add Gmail credentials for real email delivery
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

> **Note:** If Gmail credentials are not set, the app runs in **Development Mode** and prints generated OTPs to the terminal console and on-screen for effortless local testing.

### 4. Run the Application
Start both the backend server and frontend development server concurrently:
```bash
npm run dev:all
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚙️ Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/passop` |
| `JWT_SECRET` | Secret key used to sign authentication tokens | `passsaver_jwt_secret` |
| `GMAIL_USER` | Gmail address for sending verification emails | `""` |
| `GMAIL_APP_PASSWORD` | 16-character Google App Password | `""` |

---

## 🌐 Deployment Guide

### Deploying the Backend (Render.com)
1. Create a free Web Service on [Render](https://render.com).
2. Connect your GitHub repository.
3. Set **Build Command** to `npm install` and **Start Command** to `node backend/server.js`.
4. Add your `MONGO_URI`, `JWT_SECRET`, `GMAIL_USER`, and `GMAIL_APP_PASSWORD` under **Environment Variables**.

### Deploying the Frontend (Vercel)
1. Import your repository into [Vercel](https://vercel.com).
2. Add a `vercel.json` rewrite file to proxy `/api` requests to your deployed backend URL:
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://your-backend.onrender.com/api/:path*" }
     ]
   }
   ```

---

## 🔒 Security Practices

- **Temporary OTPs**: Codes expire automatically after 5 minutes using MongoDB TTL indexing.
- **JWT Protection**: Password CRUD endpoints require valid Bearer token authentication.
- **User Scoping**: Database queries are strictly scoped by `userId`, preventing cross-account access.
- **Safe Secrets**: All private keys and database credentials are excluded from source control via `.gitignore`.

---

## 👤 Author

**Sayantan Ghosal**
- GitHub: [@Sunnysines](https://github.com/Sunnysines)

---

## 📄 License

This project is licensed under the MIT License — feel free to use and modify for personal and educational purposes.
