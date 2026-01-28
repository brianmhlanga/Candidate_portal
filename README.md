# Candidate Portal & Admin Dashboard

A comprehensive full-stack application for managing candidate onboarding, media submissions, and administrative reviews.

## 🚀 Features

### For Candidates
- **Multi-step Onboarding:** Guided flow including profile setup, IQ assessment (placeholder), and professional details.
- **Media Uploads:** Secure upload for profile photos, audio introductions, and video presentations.
- **Progress Tracking:** Real-time visual progress bar and step persistence.
- **Responsive Design:** specific "Gold" aesthetic optimized for all devices.

### For Admins
- **Dashboard:** Overview of total candidates, pending reviews, and recent activity.
- **Media Review:** Specialized players for reviewing video, audio, and photo submissions.
- **Approval Workflow:** One-click Approve/Reject functionality with status updates.
- **Candidate Management:** Search, filter, and view detailed candidate profiles.

## 🛠 Tech Stack

- **Frontend:** React (Vite), TypeScript, Bootstrap, CSS Modules.
- **Backend:** Node.js, Express.js.
- **Database:** MySQL / MariaDB (Sequelize ORM).
- **Authentication:** JWT (JSON Web Tokens) & Passport.js.
- **File Storage:** Local filesystem (readily adaptable to S3).

## 📂 Project Structure

```
├── backend/            # Express.js API Server
│   ├── config/         # Database & Passport config
│   ├── controllers/    # Business logic
│   ├── models/         # Sequelize database models
│   ├── routes/         # API endpoints
│   └── uploads/        # Stored media files
│
├── frontend/           # React Client
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route pages (Admin & User)
│   │   └── context/    # Auth & State management
│   └── public/         # Static assets
```

## ⚡ Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL or MariaDB

### 1. Backend Setup
```bash
cd backend/backend
cp .env.example .env
# Configure your DB credentials in .env
npm install
npm start
```
The server runs on **http://localhost:5000**.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The client runs on **http://localhost:5173** (typically).

## 🚀 Deployment

For detailed deployment instructions (VPS, Nginx, PM2), please refer to the [Deployment Guide](deployment_guide.md) included in this repository.

## 📄 License
Proprietary. All rights reserved.
