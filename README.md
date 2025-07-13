# Quizzy - Online Quiz Management System

A modern, full-stack web application for creating and taking quizzes online. Built with React.js frontend and Node.js backend.

## 🚀 Features

### For Teachers
- **Create Quizzes**: Build custom quizzes with multiple-choice questions
- **Manage Questions**: Add, edit, and remove questions with customizable marks
- **Quiz Control**: Open/close quizzes for student access
- **View Results**: See detailed student performance and statistics
- **Dashboard**: Manage all created quizzes from one place

### For Students
- **Take Quizzes**: Attempt available open quizzes
- **Real-time Scoring**: Get instant results after submission
- **Progress Tracking**: View completed quizzes and scores
- **One-time Submission**: Prevent multiple attempts on the same quiz
- **User-friendly Interface**: Clean, intuitive quiz-taking experience

## 🛠️ Tech Stack

### Frontend
- **React.js** - User interface library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Styling and responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **bcrypt** - Password hashing

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd quizzy
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
MONGODB_URI=mongodb://localhost:27017/quizzy
JWT_SECRETS=your_jwt_secret_key_here
PORT=3000
```

Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd client
npm install
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3000/api

## 📁 Project Structure

```
quizzy/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middlewares/      # Custom middlewares
│   ├── config/           # Database configuration
│   ├── index.js          # Server entry point
│   └── package.json
└── README.md
```

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Users register with email and password
- Passwords are hashed using bcrypt
- JWT tokens are stored in localStorage
- Protected routes require valid authentication

## 👥 User Roles

### Teacher
- Can create and manage quizzes
- View student results and statistics
- Control quiz availability (open/close)

### Student
- Can take available quizzes
- View their quiz history and scores
- Cannot retake completed quizzes

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Quiz Management
- `GET /api/quiz/` - Get all quizzes
- `GET /api/quiz/:id` - Get specific quiz
- `POST /api/quiz/create` - Create new quiz (Teacher only)
- `POST /api/quiz/:id/submit` - Submit quiz answers (Student only)
- `PATCH /api/quiz/:id/toggle-status` - Toggle quiz status (Teacher only)

## 🎨 Key Features Implementation

### Quiz Creation
- Dynamic question addition with multiple-choice answers
- Customizable marks per question
- Real-time preview of created questions
- Form validation and error handling

### Quiz Taking
- Question navigation with progress indicator
- Answer selection with visual feedback
- Submission confirmation and validation
- Automatic scoring and result display

### Result Management
- Detailed statistics for teachers
- Individual student performance tracking
- Score calculation with proper validation
- Responsive result display

## 🔧 Configuration

### Environment Variables
Create `.env` files in both client and server directories:

**Server (.env)**:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRETS=your_secret_key
PORT=3000
```

## 📞 Support

For support or questions, please create an issue in the repository.

---

**Built with ❤️ using React.js and Node.js**
