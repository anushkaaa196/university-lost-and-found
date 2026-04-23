# University Lost & Found Portal

A full-stack web application for university communities to report, search, and claim lost and found items.

## Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Frontend   | React 18 + Tailwind CSS 3 (Vite)     |
| Backend    | Node.js + Express                     |
| Database   | MongoDB (Mongoose) — in-memory fallback |
| Auth       | JWT (bcryptjs + jsonwebtoken)         |

## Quick Start

### 1. Start the Backend

```bash
cd server
npm install
npm run dev
```

Server runs at **http://localhost:5000**.  
No MongoDB installation needed — the server auto-uses `mongodb-memory-server` if no external instance is found.

### 2. Start the Frontend

```bash
cd client
npm install
npm run dev
```

App runs at **http://localhost:5173**.

## Features

- **Authentication** — Register/login with `.niet.co.in` email validation
- **Report Items** — Lost & Found forms with category, location, date, and "Held At" for found items
- **Dashboard** — Search by keywords, filter by type (Lost/Found) and category
- **Claim Workflow** — Claim button triggers a notification to the item reporter
- **Notifications** — Real-time unread badge + notifications page
- **My Items** — View and manage your own reported items

## Project Structure

```
university-lost-and-found/
├── server/
│   ├── server.js
│   ├── middleware/auth.js
│   ├── models/  (User, Item, Notification)
│   └── routes/  (auth, items, notifications)
└── client/
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── components/  (Navbar, ItemCard, ProtectedRoute)
        └── pages/       (Login, Register, Dashboard, Report, Detail, MyItems, Notifications)
```
