# GigFlow - Freelance Marketplace Platform

> A full-stack mini-freelance marketplace where clients can post jobs (Gigs) and freelancers can apply for them (Bids), featuring secure authentication, real-time notifications, and atomic transaction handling.
---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features Implemented](#-features-implemented)
- [Technical Stack](#-technical-stack)
- [Architecture & Data Models](#-architecture--data-models)
- [API Reference](#-api-reference)
- [Setup & Installation](#-setup--installation)
- [Testing the Application](#-testing-the-application)
- [Bonus Features](#-bonus-features)
- [Project Structure](#-project-structure)

---

## 🎯 Project Overview

GigFlow is a comprehensive freelance marketplace platform built as part of the Full Stack Development Internship Assignment. The platform enables users to seamlessly switch between client and freelancer roles, posting jobs and submitting bids with complete transactional integrity and real-time notifications.

**Key Highlights:**
- ✅ Secure JWT authentication with HttpOnly cookies
- ✅ Complete CRUD operations for gig management
- ✅ Atomic hiring logic with MongoDB transactions (Bonus 1)
- ✅ Real-time Socket.io notifications (Bonus 2)
- ✅ Race condition prevention for concurrent hire attempts
- ✅ Responsive UI with Tailwind CSS

---

## ✨ Features Implemented

### Core Features

#### A. User Authentication
- **Secure Sign-up and Login** with bcrypt password hashing
- **JWT-based authentication** stored in HttpOnly cookies for enhanced security
- **Fluid roles**: Users can act as both clients (posting gigs) and freelancers (submitting bids)
- **Session management** with `GET /api/auth/me` endpoint for persistent authentication

#### B. Gig Management (CRUD)
- **Browse Gigs**: Public/protected feed displaying all open jobs
- **Search Functionality**: Real-time search filtering by job title (case-insensitive)
- **Create Gigs**: Protected form for logged-in users to post jobs with:
	- Title
	- Description
	- Budget
- **Automatic status tracking**: Gigs transition from `open` to `assigned` upon hiring

#### C. The Hiring Logic (Critical Implementation)
1. **Bidding**: Freelancers submit bids with custom messages and proposed prices
2. **Review**: Clients view all bids submitted for their gigs (owner-only access)
3. **Hiring**: Client clicks "Hire" button triggering atomic operations:
	 - ✅ Gig status changes from `open` to `assigned`
	 - ✅ Selected bid status becomes `hired`
	 - ✅ All other bids for the same gig are automatically marked as `rejected`
	 - ✅ **Transaction-based execution** ensures data consistency

---

## 🛠 Technical Stack

### Frontend
- **React.js** (with Vite for fast development)
- **Tailwind CSS** for responsive styling
- **Context API** for state management
- **Socket.io Client** for real-time notifications
- **Axios** for API communication with credential support

### Backend
- **Node.js** + **Express.js**
- **MongoDB** with **Mongoose ODM**
- **JWT** authentication with HttpOnly cookies
- **Socket.io** for WebSocket connections
- **Bcrypt** for password hashing
- **MongoDB Transactions** for atomic operations

---

## 🏗 Architecture & Data Models

### Database Schema

#### User Model
```javascript
{
	name: String (required),
	email: String (required, unique),
	password: String (hashed with bcrypt)
}
```

#### Gig Model
```javascript
{
	title: String (required),
	description: String (required),
	budget: Number (required),
	ownerId: ObjectId -> User,
	status: String (enum: ['open', 'assigned'], default: 'open')
}
```

#### Bid Model
```javascript
{
	gigId: ObjectId -> Gig,
	freelancerId: ObjectId -> User,
	message: String (required),
	price: Number (required),
	status: String (enum: ['pending', 'hired', 'rejected'], default: 'pending')
}
```

---

## 🔌 API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login & set HttpOnly cookie | ❌ |
| GET | `/api/auth/me` | Get current user session | ✅ |
| POST | `/api/auth/logout` | Clear auth cookie | ✅ |

**Request/Response Examples:**

**Register:**
```json
// Request
{
	"name": "John Doe",
	"email": "john@example.com",
	"password": "securePassword123"
}

// Response
{
	"user": {
		"id": "507f1f77bcf86cd799439011",
		"name": "John Doe",
		"email": "john@example.com"
	}
}
```

### Gigs Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/gigs` | Fetch all gigs (with optional search) | ✅ |
| POST | `/api/gigs` | Create a new gig | ✅ |

**Query Parameters:**
- `search` (optional): Filter gigs by title

**Create Gig:**
```json
// Request
{
	"title": "Build a React App",
	"description": "Need a developer to build a React application",
	"budget": 5000
}
```

### Bids Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bids` | Submit a bid on a gig | ✅ |
| GET | `/api/bids/:gigId` | Get all bids for a gig (Owner only) | ✅ |
| PATCH | `/api/bids/:bidId/hire` | **Hire a freelancer** (Atomic) | ✅ |

**Submit Bid:**
```json
// Request
{
	"gigId": "507f1f77bcf86cd799439011",
	"message": "I can complete this project in 2 weeks",
	"price": 4500
}
```

**Hire Logic (CRITICAL):**
The `/api/bids/:bidId/hire` endpoint performs atomic operations using MongoDB transactions:
1. Validates bid ownership and gig status
2. Updates gig status to `assigned`
3. Marks selected bid as `hired`
4. Rejects all other bids for the gig
5. Emits Socket.io event to hired freelancer

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone Repository
```bash
git clone <your-github-repo-url>
cd gigflow
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `backend/` directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
PORT=8000
NODE_ENV=development
```

Start backend server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in `frontend/` directory (optional):
```env
VITE_API_URL=http://localhost:8000/api
```

Start frontend development server:
```bash
npm run dev
# Open http://localhost:3000
```

---

## 🧪 Testing the Application

### Complete Workflow Test

1. **User Registration & Authentication**
	 - Register two users: one as client, one as freelancer
	 - Verify JWT cookie is set and persistent across page refreshes

2. **Post a Gig (Client Role)**
	 - Login as User 1
	 - Navigate to `/post-gig`
	 - Create a new gig with title, description, and budget
	 - Verify gig appears in dashboard with `open` status

3. **Submit a Bid (Freelancer Role)**
	 - Login as User 2
	 - Browse `/dashboard` and search for gigs
	 - Open gig details page
	 - Submit a bid with custom message and price
	 - Verify bid submission confirmation

4. **Review & Hire (Client Role)**
	 - Switch back to User 1 (client)
	 - Open the posted gig details
	 - View all received bids with freelancer information
	 - Click "Hire" on a specific bid
	 - Verify:
		 - Gig status changes to `assigned`
		 - Selected bid marked as `hired`
		 - Other bids marked as `rejected`

5. **Real-time Notification (Freelancer)**
	 - As User 2, ensure you're logged in and connected
	 - When hired by User 1, receive instant notification
	 - Alert displays: "You have been hired for [Gig Title]!"

---

## 🎁 Bonus Features

### Bonus 1: Transactional Integrity (Race Conditions) ✅

**Implementation Details:**
- Uses **MongoDB transactions** with Mongoose sessions
- Atomic updates ensure only one bid can be hired per gig
- Race condition prevention: If two admins attempt to hire different freelancers simultaneously, only the first transaction completes successfully
- Located in: `backend/src/controllers/bids.controller.js` - `hireBid` function

**Code Snippet:**
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
	// Atomic operations within transaction
	// Update gig, update hired bid, reject other bids
	await session.commitTransaction();
} catch (error) {
	await session.abortTransaction();
	throw error;
} finally {
	session.endSession();
}
```

### Bonus 2: Real-time Updates (Socket.io) ✅

**Implementation Details:**
- **Backend**: Socket.io server integrated with Express
	- Cookie-based authentication during WebSocket handshake
	- User-specific socket rooms (room ID = user ID)
	- Emits `hired` event to freelancer's room upon successful hire
  
- **Frontend**: Socket.io client integration
	- Connects after successful login
	- Listens for `hired` events
	- Displays instant notification alerts without page refresh

**Files:**
- Backend: `backend/src/utils/socket.js`
- Frontend: `frontend/src/context/AuthContext.jsx`

**Flow:**
1. Client hires freelancer via API
2. Backend emits `hired` event to freelancer's socket room
3. Frontend receives event and displays notification
4. No page refresh required

---

## 📁 Project Structure

```
gigflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Authentication logic
│   │   │   ├── gigs.controller.js    # Gig CRUD operations
│   │   │   └── bids.controller.js    # Bid & hire logic (with transactions)
│   │   ├── middleware/
│   │   │   └── auth.middleware.js    # JWT verification
│   │   ├── models/
│   │   │   ├── User.js               # User schema
│   │   │   ├── Gig.js                # Gig schema
│   │   │   └── Bid.js                # Bid schema
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # Auth endpoints
│   │   │   ├── gigs.routes.js        # Gig endpoints
│   │   │   └── bids.routes.js        # Bid endpoints
│   │   ├── utils/
│   │   │   └── socket.js             # Socket.io initialization
│   │   └── server.js                 # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              # Axios instance with credentials
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── GigCard.jsx
│   │   │   ├── GigDetailsCard.jsx
│   │   │   ├── BidList.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth state & Socket.io client
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PostGig.jsx
│   │   │   └── GigDetails.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
└── README.md
```

### Key Files Explained

**Backend:**
- `server.js`: Application bootstrap, routes mounting, Socket.io initialization
- `bids.controller.js`: Contains the critical `hireBid` function with MongoDB transactions
- `socket.js`: Handles WebSocket authentication and room management

**Frontend:**
- `AuthContext.jsx`: Manages authentication state, Socket.io client connection, and real-time event listeners
- `axios.js`: Configured with `withCredentials: true` for cookie-based authentication
- `GigDetails.jsx`: Displays gig information, bid submission form, and bid management for owners

---

## 🔒 Security Features

- **HttpOnly Cookies**: JWT tokens stored securely, inaccessible to JavaScript
- **Password Hashing**: Bcrypt with salt rounds for secure password storage
- **CORS Configuration**: Restricted to specific frontend origin
- **Owner Validation**: Server-side checks ensure only gig owners can view/manage bids
- **Transaction Rollback**: MongoDB transactions prevent partial updates on errors

---

## 📝 Environment Variables

### Backend `.env.example`
```env
MONGO_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:3000
PORT=8000
NODE_ENV=development
```

### Frontend `.env.example`
```env
VITE_API_URL=http://localhost:8000/api
```
---

## 📄 License

This project was created as part of a Full Stack Development Internship Assignment.

---

## Author

- Gopal Mehtre.

