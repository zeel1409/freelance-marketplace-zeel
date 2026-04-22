# Freelance Marketplace - Fiverr Clone

A professional, full-stack freelance marketplace platform built with the MERN-ish stack (React, Node.js, Express) and Supabase. This project features a robust authentication system, gig management, order processing, and real-time-like messaging.

[![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://freelance-marketplace-zeel.vercel.app/)
[![Render](https://img.shields.io/badge/Render-Backend-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://freelance-marketplace-zeel.onrender.com)

---

## 🚀 Features

### For Clients
- **Gig Discovery**: Browse and search for gigs by category or title.
- **Order Management**: Create orders with specific requirements.
- **Reviews**: Leave ratings and feedback for completed services.
- **Profile**: Manage personal details and view history.

### For Freelancers
- **Gig Creation**: Set up professional service listings with pricing and delivery timelines.
- **Sales Tracking**: Manage incoming orders and update delivery status.
- **Direct Messaging**: Communicate with clients through a dedicated messaging interface.

### Core Features
- **Secure Authentication**: Built using Supabase Auth (JWT).
- **Role-Based Access**: Specialized interfaces for Clients and Freelancers.
- **Responsive UI**: Modern, clean design optimized for all devices using Tailwind CSS.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State/Data**: Fetch API + Custom Hooks
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database/ORM**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

---

## 📂 Project Structure

```text
/
├── server/             # Express Backend
│   ├── src/            # TS Source files
│   │   └── index.ts    # Main API Entry & Routes
│   └── tsconfig.json   # Backend TS Config
├── src/                # React Frontend
│   ├── components/     # Reusable UI & Logic
│   ├── contexts/       # Auth & State Contexts
│   ├── pages/          # Full page components
│   └── lib/            # Shared utilities
├── .env                # Frontend Environment Variables
└── package.json        # Frontend scripts & dependencies
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js (v18+)
- Supabase Account

### 1. Clone the repository
```bash
git clone https://github.com/zeel1409/freelance-marketplace-zeel.git
cd freelance-marketplace-zeel
```

### 2. Backend Setup
```bash
cd server
npm install
# Create a .env file based on the section below
npm run dev
```

### 3. Frontend Setup
```bash
# In the root directory
npm install
# Create a .env file based on the section below
npm run dev
```

---

## 🔑 Environment Variables

### Frontend (`/.env`)
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8080/api
```

### Backend (`/server/.env`)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
PORT=8080
```

---

## 🌐 Deployment

- **Frontend**: Hosted on **Vercel** with automatic deployments from the `main` branch.
- **Backend**: Hosted on **Render** (Web Service) with the root directory set to `server`.

---

## 👤 Author

**Zeel Kadiya**
- GitHub: [@zeel1409](https://github.com/zeel1409)
- Portfolio: [Freelance Marketplace](https://freelance-marketplace-zeel.vercel.app/)

---

## 📄 License
This project is licensed under the MIT License.
