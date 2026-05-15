# ✅ TaskFlow – Full-Stack Task Management App

**TaskFlow** is a **production-grade task management platform** designed to help individuals and teams **organize projects, track tasks, and boost productivity** - all in one place.

This repository contains the **complete full-stack implementation**, featuring a **secure REST API backend** and a **modern, responsive React frontend**.

---

## 🚀 Live Demo

🌐 **Frontend:** [https://taskflow107.vercel.app](https://taskflow107.vercel.app)  
🔗 **Backend API:** [taskflow-production-48ce.up.railway.app/api/health](https://taskflow-production-48ce.up.railway.app/api/health)

---

## 📌 Project Overview

The goal of **TaskFlow** is to deliver a **seamless task management experience** with a focus on **security, performance, and usability**.

The app allows users to **register securely**, create **projects**, manage **tasks**, and track progress all backed by a robust REST API with JWT authentication and a PostgreSQL database.

---

## 🎯 Key Features

### 🔐 Authentication & Security
- Secure **JWT-based authentication** (Sign Up / Sign In)
- Password hashing with **bcrypt**
- Protected routes on both frontend and backend

### 📋 Project & Task Management
- Create and manage **multiple projects**
- Add, update, and delete **tasks** within projects
- Track task status and progress

### 🖥️ Frontend
- Modern, **responsive UI** built with React + Vite
- Clean **dashboard** with intuitive navigation
- Form validation and error handling
- Fast page loads with **Vite build optimization**

### ⚙️ Backend
- RESTful **Express.js API**
- **Prisma ORM** for type-safe database access
- **PostgreSQL** database with schema migrations
- Environment-based configuration

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React.js** | UI framework |
| **Vite** | Build tool & dev server |
| **React Router** | Client-side routing |
| **Axios** | HTTP requests |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **Prisma ORM** | Database ORM |
| **PostgreSQL** | Relational database |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |

### DevOps & Deployment
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting |
| **Railway** | Backend + Database hosting |
| **GitHub** | Version control |

---

## 🏗️ Project Architecture 
<img width="1717" height="699" alt="project-architecture" src="https://github.com/user-attachments/assets/9547f928-c950-480a-b475-7453f784920d" />


---

## 🏛️ Project Structure

```
taskflow/
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level pages
│   │   ├── api/             # Axios API calls
│   │   └── main.jsx         # App entry point
│   └── package.json
│
├── backend/                 # Express.js backend
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Auth middleware
│   │   └── index.js         # Server entry point
│   └── package.json
│
└── .gitignore
```

---

## ⚙️ Environment Variables

### Backend (Railway)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.up.railway.app/api
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js v18+
- PostgreSQL database
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/Anmolso107/taskflow.git
cd taskflow
```

### 2. Setup Backend
```bash
cd backend
npm install
# Create .env file with your variables
npx prisma migrate dev
node src/index.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
# Create .env file with VITE_API_URL
npm run dev
```

---

## 📸 Screenshots

### 🔹 Sign Up Page 
<img width="1919" height="862" alt="signup-page" src="https://github.com/user-attachments/assets/91c9b351-fd0f-4017-8085-6f4bc057e75b" />
> Create a new account securely with JWT-based authentication.

### 🔹 Dashboard
<img width="1917" height="859" alt="dashboard-page" src="https://github.com/user-attachments/assets/6972dfb6-d2a3-4579-b241-42a40ebe4c57" />
> Manage all your projects and tasks from one clean interface.

### 🔹 Task Management
<img width="1919" height="853" alt="projects-page" src="https://github.com/user-attachments/assets/57e27e79-ba0e-42b7-b3b4-322438c8a5b4" />
<img width="1913" height="858" alt="taskanalysis" src="https://github.com/user-attachments/assets/33fe720e-f46c-43a0-adc3-09a1650657d0" />
<img width="1919" height="861" alt="tasks-page" src="https://github.com/user-attachments/assets/832b4d25-68c4-47c9-9893-10d1e75bf4e0" />

> Add, update, and track tasks within each project.

---

## 📌 Future Enhancements

- 👥 **Team collaboration** — invite members to projects
- 🔔 **Real-time notifications** with WebSockets
- 📊 **Analytics dashboard** — task completion charts
- 🏷️ **Task labels & priorities** — High / Medium / Low
- 📅 **Due dates & reminders**
- 🌙 **Dark mode** toggle

---

## 🧑‍💻 Author

**Anmol Soni**

- 📧 Email: [sonianmol285@gmail.com](mailto:sonianmol285@gmail.com)
- 🐙 GitHub: [Anmolso107](https://github.com/Anmolso107)
- 💼 LinkedIn: [Anmol Soni](https://www.linkedin.com/in/anmol-soni-84b624295/)

---

⭐ *If you found this project helpful, consider giving it a star!*
