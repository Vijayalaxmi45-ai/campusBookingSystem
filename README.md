# BookMyCampus - Smart Campus Resource Management 🎓

<div align="center">
  <h1>📚 BookMyCampus</h1>
  <p><strong>A Modern, Full-Stack Campus Facility Booking & Management System</strong></p>
  <p>Powered by React, Tailwind CSS, Node.js, MySQL, and Google Cloud Technologies</p>
</div>

---

## 🌟 Overview

BookMyCampus is a comprehensive SaaS-style web application designed to streamline the allocation and booking of campus resources (laboratories, auditoriums, sports grounds, classrooms, etc.) for students and faculty. It features a modern, responsive UI and a robust, ACID-compliant backend to guarantee zero double-bookings.

---

## 🚀 Key Google Technologies Integrated

This project has been upgraded to leverage powerful Google APIs, making it perfect for Google Solution Challenge deployments:

1. **Google OAuth 2.0 (Google Sign-In)**: Secure, passwordless authentication.
2. **Google UserInfo API**: Fetches real user profile data (name, email, profile picture) dynamically.
3. **Google Maps Embed API**: Interactive campus map pinpointing exact college locations.
4. **Google Gemini 1.5 Flash API**: Powers the "CampusMitra AI" chatbot, providing context-aware, intelligent answers about campus resources in real-time.

---

## 🛠️ Tech Stack

**Frontend Architecture:**
- **Framework**: React.js (via Vite)
- **Styling**: Tailwind CSS, PostCSS
- **Components**: Framer Motion (animations), Lucide React (icons)
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Google Integrations**: `@react-oauth/google`, Gemini REST API

**Backend Architecture:**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Security**: bcrypt, CORS, OAuth token validation

**Database:**
- **Engine**: MySQL
- **Integrity**: Full ACID transactions with row-level locking (`FOR UPDATE`) to prevent race conditions during bookings.

---

## 🌟 Features

### 🔐 Authentication System
- Secure Google Sign-In integration.
- Fallback manual registration with bcrypt hashing.
- Role-based access control (Student, Faculty, Admin).
- Hidden "Administrator" login mode.

### 📅 Resource Booking System
- Book campus facilities with real-time availability checking.
- **ACID-compliant transactions** to prevent double bookings.
- Time slot conflict detection with database row-level locking.
- Automated QR Code Entry Pass generation for approved bookings.

### 🤖 CampusMitra AI
- Floating, interactive AI assistant powered by Google Gemini.
- Reads real-time database context (resource counts, availability, timetable).
- Can answer complex queries about facility status and booking procedures.

### 🏢 Resource & Timetable Management
- View all available and occupied resources in a grid layout.
- Access the Class Timetable with dynamic filtering (Department & Semester).
- Interactive Campus Calendar view (powered by FullCalendar).

### 🔔 Notification System
- Real-time approval/rejection notifications.
- Booking confirmation alerts.
- Unread notification badges and toast alerts.

### ⚙️ Admin Dashboard
- **Manage Bookings**: Approve, reject, or delete booking requests.
- **Manage Resources**: Full CRUD operations for campus facilities.

---

## 📁 Project Structure

```
BookMyCampus/
│
├── backend/                  # Node.js + Express API
│   ├── server.js             # Main server entry
│   ├── db.js                 # MySQL connection pool
│   ├── migrate.js            # Database migration script
│   └── routes/               # API endpoint definitions
│       ├── auth.js           # Auth & Google Login
│       └── bookings.js       # Bookings, Resources, Notifications
│
├── frontend-react/           # React + Vite SPA
│   ├── src/
│   │   ├── api/              # Axios API calls
│   │   ├── components/       # UI Components, Layout, CampusMitra AI
│   │   ├── context/          # AuthContext
│   │   ├── pages/            # Dashboard, Timetable, Map, Admin Panel
│   │   ├── lib/              # Utility functions
│   │   └── App.jsx           # Main router configuration
│   ├── index.css             # Tailwind & Base CSS
│   ├── .env                  # Google API Keys
│   └── package.json
│
└── database/                 # SQL Schemas
    ├── schema.sql
    └── bookings_schema.sql
```

---

## 🏆 Setup & Installation

Please refer to the detailed [SETUP_GUIDE.md](SETUP_GUIDE.md) for step-by-step instructions on setting up the MySQL database, installing dependencies, configuring Google Cloud credentials, and running the local development servers.

---

## 📄 License

MIT License - Free to use for hackathons, learning, and academic purposes!

<div align="center">
  <br>
  <p><strong>Built with ❤️ for Campus Communities</strong></p>
  <p><em>Zero Double Bookings. Maximum Efficiency.</em></p>
</div>
