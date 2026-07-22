# SkillHire — Skilled Worker Hiring Platform

SkillHire is a modern web application built on the MERN stack (MongoDB, Express, React, Node.js) that connects local skilled workers (electricians, plumbers, carpenters, etc.) with customers looking for home services and repairs. The application features a stunning, premium dark-themed **Glassmorphism/Acrylic** design system with a fully responsive layout.

---

## 📸 Application Screenshots

*Here are some suggested views to capture. Save your screenshots as `.png` files in a folder named `screenshots/` at the root of the project to have them render automatically on GitHub:*

| Main Search Dashboard (Customer View) | Worker Request Dashboard (Worker View) |
| :---: | :---: |
| ![Home Page](./screenshots/home.png) | ![Worker Dashboard](./screenshots/dashboard.png) |

| Create/Update Profile Settings | Customer Job Requests Tracking |
| :---: | :---: |
| ![Worker Profile](./screenshots/profile.png) | ![Customer Requests](./screenshots/requests.png) |

---

## ✨ Features

### 🔍 For Customers
* **Find Services Easily:** Filter and search for available local workers by skill (e.g. "plumber", "electrician") and city (e.g. "Mumbai", "Delhi").
* **Book Services:** Send request notifications to workers with a single click.
* **Track Booking Status:** Monitor your request lifecycle (Pending ➔ Accepted/Rejected ➔ Completed).
* **Feedback & Reviews:** Rate completed jobs (1-5 stars) and write comments. Ratings automatically update the worker's average profile stats.
* **Notification System:** Receive real-time-like polling notification updates whenever a worker accepts, rejects, or completes a job.

### 🛠️ For Workers
* **Profile Customization:** Build a professional card profile specifying skills, city location, contact details, experience level, and a personal bio.
* **Availability Toggle:** Set profile status to Online (Available) or Offline (Busy) to appear or disappear from customer search directories.
* **Manage Inbound Bookings:** Accept or reject pending incoming bookings, and mark running jobs as completed once done.
* **Dashboard Analytics:** Track client emails, requested skills, and jobs directly.

---

## 💻 Tech Stack

* **Frontend:** React.js (v19), React Router DOM (v7), Vanilla CSS (Custom Glassmorphism themes, dynamic animations, variables, responsive design), Axios (API client)
* **Backend:** Node.js, Express.js (v5), Mongoose / MongoDB Atlas
* **Authentication:** JSON Web Tokens (JWT) for secure session headers, `bcryptjs` for secure password hashing

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) installed (v18+)
* [MongoDB](https://www.mongodb.com/) account or local community server running

### 1. Clone the Repository
```bash
git clone https://github.com/Jay-gadhavi/job-hiring-platform.git
cd job-hiring-platform
```

### 2. Configure Backend `.env` Settings
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

### 3. Install Dependencies & Launch Backend
```bash
cd backend
npm install
node server.js
```
*The server will boot up on port `5000`.*

### 4. Install Dependencies & Launch Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm start
```
*The app will launch on [http://localhost:3000](http://localhost:3000).*

---

## 📂 Codebase Directory Structure

```text
├── backend/
│   ├── config/             # Database connection setup
│   ├── middleware/         # Authentication check middleware
│   ├── models/             # Mongoose Schemas (User, Worker, Job, Review, Notification)
│   ├── routes/             # Express API Endpoints
│   ├── .env                # Local configuration (Ignored in Git)
│   └── server.js           # Server startup script
├── frontend/
│   ├── public/             # Static page assets
│   └── src/
│       ├── api/            # Axios API config
│       ├── components/     # Reusable components (e.g., NotificationBell)
│       ├── pages/          # Page layouts (Home, Dashboard, Profile, Auth)
│       ├── App.js          # Route routing tree
│       └── index.css       # Core styling & glassmorphism theme variables
└── README.md               # Documentation guide
```

---

## 🗺️ Project Roadmap (Future Upgrades)

- [ ] **Admin Panel:** A moderation suite to handle user disputes and inspect global stats.
- [ ] **Payment Integration:** Secure Stripe or Razorpay escrow flows after task completions.
- [ ] **Real-Time WebSockets:** Convert active short-polling loops into real-time WebSockets (`socket.io`).
- [ ] **Geospatial Searches:** MongoDB `$nearSphere` queries to filter workers by local radius distances rather than exact text city matching.
- [ ] **Mobile Client:** Build a React Native version for mobile devices.
