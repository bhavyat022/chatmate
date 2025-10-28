# 💬 ChatMate – Real-Time Messaging App

ChatMate is a **real-time messaging web app** built with **FastAPI**, **Next.js**, and **Supabase** that allows users to:
- Sign up, log in, and manage profiles.
- Send and accept connection requests (like LinkedIn).
- Chat with connected users in real-time using **WebSockets**.
- View date-separated chats (“Today”, “Yesterday”, etc.).
- Preserve text formatting and line breaks.

---

## 🏗️ Project Architecture

chatmate/
├── backend/ # FastAPI backend
│ ├── app/
│ │ ├── api/v1/ # Route definitions
│ │ │ ├── auth.py
│ │ │ ├── profiles.py
│ │ │ ├── connections.py
│ │ │ ├── messages.py
│ │ │ ├── conversations.py
│ │ │ └── ws.py # WebSocket logic
│ │ ├── core/ # Core config and services
│ │ │ ├── config.py
│ │ │ ├── security.py
│ │ │ └── supabase_client.py
│ │ └── schemas/ # Pydantic schema models
│ │ ├── auth.py
│ │ ├── profiles.py
│ │ ├── messages.py
│ │ ├── connections.py
│ │ └── conversations.py
│ └── main.py
│
├── chat-frontend/ # Next.js + TypeScript frontend
│ ├── src/
│ │ ├── pages/
│ │ │ ├── index.tsx
│ │ │ ├── login.tsx
│ │ │ ├── signup.tsx
│ │ │ ├── profile.tsx
│ │ │ ├── connections.tsx
│ │ │ └── chat/[id].tsx # Chat UI
│ │ ├── services/ # API service helpers
│ │ └── store/ # Zustand stores for state mgmt
│ ├── public/
│ └── package.json
│
├── .gitignore
└── README.md

---

## ⚙️ Technologies Used

| Layer | Stack |
|-------|--------|
| **Frontend** | Next.js 15, TypeScript, Zustand, TailwindCSS |
| **Backend** | FastAPI, Pydantic, Supabase Python Client |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Realtime** | WebSockets (FastAPI) |
| **State Management** | Zustand |
| **Styling** | Tailwind CSS |
| **Deployment (optional)** | Vercel (frontend), Render/Fly.io (backend) |

---

## 🧩 Supabase Database Schema

Your schema consists of 4 core tables:

| Table | Description |
|--------|-------------|
| **profiles** | Stores user profile info (`username`, `first_name`, `last_name`, `phone`, `avatar_url`) |
| **connections** | Handles connection requests and statuses (`requester_id`, `addressee_id`, `status`) |
| **conversations** | Represents chat sessions between two users (`user1_id`, `user2_id`) |
| **messages** | Stores actual messages (`sender_id`, `receiver_id`, `body`, `created_at`, `read_at`) |

---

## ⚙️ Setup & Installation
🔹 1. Clone the repository
git clone https://github.com/bhavyatummala/realtime-chat-app.git
cd realtime-chat-app

🔹 2. Setup environment variables
📂 backend/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret

📂 chat-frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

---

## 🚀 Running the Project
▶️ Backend (FastAPI)
cd backend
poetry install
poetry run uvicorn app.main:app --reload


Server → http://localhost:8000
Docs → http://localhost:8000/docs

▶️ Frontend (Next.js)
cd chat-frontend/chat-frontend
bun install        # or npm install
bun dev            # or npm run dev

Frontend → http://localhost:3000

---

## 💡 Features
✅ Supabase Auth – Secure sign up & login
✅ Profile Management – Create & update user info
✅ Connections – Send / accept / view requests
✅ Chat – Real-time WebSocket chat between connected users
✅ Message Formatting – Grouped by date, timestamps, auto-scroll
✅ UI Enhancements – Responsive design, smooth navigation, auto-resizing input

---

## 🔄 WebSocket Chat Flow

User connects to WebSocket:

ws://localhost:8000/ws/chat/{user_id}

Backend tracks active users.

When a message is sent:

It’s saved in Supabase.

The backend broadcasts it via WebSocket.

Frontend listens:

ws.onmessage = (event) => {

  const msg = JSON.parse(event.data);
  
  addOne(msg); // update local store instantly
  
};

Both sender and receiver see new messages live.

---

## 🧭 Demo Workflow

Signup/Login → via Supabase Auth
Profile Setup → create your profile
Connections Page → send or accept requests
Chat Page → real-time messages appear instantly
Back Navigation → go from Chat → Connections → Profile

---

## 🔮 Future Enhancements

🟢 File & Image sharing in chat
🟢 “Typing…” indicators
🟢 Real-time online status
🟢 Push notifications
🟢 Group conversations
🟢 Dark mode toggle

---

## 👩‍💻 Author
Bhavya Tummala
tummalabhavya5b7@gmail.com
