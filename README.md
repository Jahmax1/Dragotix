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