# DragonTix

DragonTix is a full-stack event ticketing platform built with React, Node.js, Express, and MongoDB. It allows users to browse events, purchase tickets, and view their tickets with QR codes. Organizers can create and manage events, set ticket types and availability, and verify tickets using a QR code scanner.

## Features

### For Users
- Browse available events and view event details.
- Purchase tickets using Stripe payment integration (test mode).
- View purchased tickets and QR codes in the user dashboard.

### For Organizers/Admins
- Create events with multiple ticket types and set ticket availability.
- View event details and ticket statistics in the admin dashboard.
- Verify tickets by scanning QR codes at the event.

### Authentication & Authorization
- Role-based authentication for users (`user`) and organizers (`organizer`).
- Protected routes to ensure users can only access their respective dashboards.
- Automatic redirection after login/registration to the appropriate dashboard (`/dashboard` for users, `/admin-dashboard` for organizers).

## Tech Stack
- **Frontend**: React, React Router, Tailwind CSS, Framer Motion (for animations)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Payment Integration**: Stripe (test mode)
- **API Requests**: Axios
- **Authentication**: JWT (JSON Web Tokens) stored in localStorage
- **Deployment**: (Add deployment details if applicable, e.g., Vercel for frontend, Render for backend)

## Project Structure
dragontix/
├── client/                   # Frontend (React app)
│   ├── src/
│   │   ├── components/       # Reusable components (e.g., ProtectedRoute, RoleProtectedRoute)
│   │   ├── context/          # React Context (e.g., AuthContext for authentication)
│   │   ├── pages/            # Page components (e.g., Login, Register, Dashboard)
│   │   ├── api.js            # Axios instance for API requests
│   │   ├── App.jsx           # Main app component with routing
│   │   ├── index.js          # Entry point for React app
│   │   └── index.css         # Global styles (Tailwind CSS)
├── server/                   # Backend (Node.js/Express app)
│   ├── models/               # Mongoose models (e.g., User, Event, Ticket)
│   ├── routes/               # API routes (e.g., auth, events, tickets)
│   ├── middleware/           # Middleware (e.g., auth middleware for JWT)
│   ├── config/               # Configuration (e.g., database connection)
│   ├── server.js             # Main server file
│   └── .env                  # Environment variables (e.g., MongoDB URI, Stripe key)
├── README.md                 # Project documentation
└── package.json              # Root-level dependencies and scripts


## Prerequisites
- Node.js (v16 or later)
- MongoDB (local instance or MongoDB Atlas)
- Stripe account (for test mode payment integration)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/dragontix.git
cd dragontix
