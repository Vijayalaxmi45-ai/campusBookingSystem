# BookMyCampus - Setup & Installation Guide 🚀

This guide will walk you through setting up the **BookMyCampus** full-stack application (React frontend, Node.js backend, and MySQL database).

---

## 📋 Prerequisites

Before you begin, ensure you have installed:
1. **Node.js** (v16 or higher)
2. **MySQL Server** (Running locally on port 3306 or 3307)
3. **Git**

---

## Step 1: Database Setup

1. Open your MySQL command line or a GUI tool like MySQL Workbench.
2. Run the SQL schema files located in the `database` folder to create the tables and seed sample data:

```sql
source d:\CampusResourceAllocationAndManagementSystem-main (2)\database\schema.sql
source d:\CampusResourceAllocationAndManagementSystem-main (2)\database\bookings_schema.sql
```

*(This creates the `users`, `resources`, `bookings`, and `notifications` tables).*

---

## Step 2: Backend Setup (Node.js API)

1. Open a new terminal window.
2. Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

3. Configure your database credentials. Open `backend/db.js` and ensure the `user`, `password`, and `port` match your local MySQL configuration.
4. **Run Database Migrations:** Run the migration script to ensure your database has the latest column updates (like `target_role` for notifications).

```bash
node migrate.js
```

5. **Start the backend server:**

```bash
npm run dev
# OR
node server.js
```
*(The server should print `🚀 BookMyCampus server running on http://localhost:5000`)*

---

## Step 3: Google API Configuration

To use Google Sign-In and the CampusMitra AI chatbot, you need API keys.

1. **Google OAuth Client ID**: 
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a project > APIs & Services > Credentials > Create OAuth Client ID (Web Application).
   - Add `http://localhost:5173` to both **Authorized JavaScript origins** and **Authorized redirect URIs**.
   - Copy your Client ID.

2. **Google Gemini API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com/).
   - Click **Get API Key** and generate a new key.

---

## Step 4: Frontend Setup (React SPA)

1. Open a **second, separate terminal window** (keep the backend running in the first one).
2. Navigate to the React frontend directory and install dependencies:

```bash
cd frontend-react
npm install
```

3. Create or open the `.env` file inside the `frontend-react` folder (`frontend-react/.env`) and add your Google keys:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GEMINI_API_KEY=your-gemini-api-key
```

4. **Start the React development server:**

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`.

---

## 🧪 Testing the Application

### 1. Test Google Sign-In
- Click the **"Sign in with Google"** button on the Login page. 
- It will automatically sync your Google Profile with the MySQL database.

### 2. Test Admin Privileges
- By default, Google Sign-in creates a `student` account.
- To test the Admin Panel, either manually create an admin account via the Signup page using the "Admin Secret Key" (`admin@123`), OR manually change your user role to `admin` in your MySQL `users` table.
- On the Login page, check the **"Login as Administrator"** box to access the secret key field.

### 3. Test CampusMitra AI
- Click the floating magical icon in the bottom right corner of the dashboard.
- Ask questions like: *"Are there any sports grounds available?"* or *"Where is my semester 4 class?"*. The Gemini API will process your database context and answer intelligently.

---

## 🐛 Troubleshooting

**Terminal says `EADDRINUSE: address already in use :::5000`?**
- You already have a Node server running in the background. Kill the existing terminal process or restart your computer, then try starting the backend again.

**"Failed to load notifications" error?**
- Make sure you ran `node migrate.js` inside the backend folder to apply database updates.

**"Error 401: invalid_client" or "redirect_uri_mismatch" during Google Login?**
- Double-check your Google Cloud Console configuration. Ensure `http://localhost:5173` is explicitly saved in your Authorized Origins and Redirect URIs.
