# Quizzy - Online Quiz Management System

A modern full-stack web application for creating, managing, and taking quizzes online. Features a subscription-based access model between teachers and students, and uses Apache Kafka for asynchronous quiz grading.

Built with React 19 (Vite) frontend and Express + MongoDB backend.

## ✨ Features

### For Teachers
- **Create Quizzes**: Build quizzes with multiple-choice questions (4 options per question), select correct answer, and assign custom marks per question
- **Quiz Visibility Control**: Toggle quizzes between open/closed for students
- **Dashboard**: View all your quizzes with stats (total, open/closed, questions), filtering, and quick actions
- **View Results**: See detailed student performance including scores, percentages, and submission timestamps in a clean table
- **Preview Quizzes**: View quiz as students would
- **Subscription Management**: Approve or reject student subscription requests to control who can access your quizzes

### For Students
- **Teacher Discovery & Subscriptions**: Browse registered teachers and send subscription requests
- **Access Control**: Only see quizzes from teachers whose subscription requests you have approved
- **Take Quizzes**: Intuitive quiz interface with question navigation, progress tracking, answer selection, and live answer count
- **Asynchronous Grading**: Submissions are processed in the background via Kafka. Immediate "Grading in Progress" feedback with automatic polling for results (up to ~30s)
- **One-time Attempts**: Prevent retakes on already-submitted quizzes
- **Instant Results**: View your score, percentage, and submission time right after grading completes
- **View Closed Quizzes**: Inspect completed or closed quizzes

### Shared / Platform
- Modern, responsive UI with dark-themed toast notifications
- Role-based dashboards and navigation
- Secure JWT authentication (token in localStorage + httpOnly cookie)
- Real-time(ish) feedback for async operations

## 🛠 Tech Stack

### Frontend (Client)
- **React 19** + **Vite 7**
- **React Router 7**
- **Bootstrap 5** for UI components
- **Axios** for API calls
- **React Toastify** for notifications
- **jwt-decode**

### Backend (Server)
- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose 8**
- **KafkaJS** for event-driven async processing
- **JWT** + **bcrypt** for auth & security
- **cookie-parser**, **cors**, **dotenv**

### Infrastructure
- **Apache Kafka** (3.7 via Docker Compose) for quiz submission queue
- Dedicated background grading worker with retry logic

## 🏗 Architecture

- Students submit quiz answers → server publishes to `quiz-submissions` Kafka topic (returns 202 Accepted immediately)
- Background **grading worker** (consumer group) processes messages:
  - Validates, calculates score against correct answers
  - Saves response to Quiz document with retries (up to 3) and exponential backoff
  - Idempotent (skips duplicates)
  - Only commits Kafka offset on successful save
- Client polls the quiz endpoint briefly after submission to retrieve the graded result
- Subscription model gates quiz visibility: students only see quizzes from approved teacher subscriptions

This design keeps the API responsive even under load and decouples grading from the request path.

## 📋 Prerequisites

- **Node.js** v18+
- **npm**
- **MongoDB** (local instance on port 27017 or MongoDB Atlas)
- **Docker** (recommended for running Kafka easily)

## ⚡ Quick Start

### 1. Clone & Navigate
```bash
git clone <repo-url>
cd Quizzy
```

### 2. Start Kafka (Required)
```bash
docker-compose up -d
```
This starts a single-node Kafka broker on `localhost:9092`.

### 3. Backend Setup
```bash
cd server
npm install
```

Create/update `.env` in `server/`:
```env
DATABASE_URL=mongodb://localhost:27017/quizzy
JWT_SECRETS=your-super-secret-key-here
```

Start the server:
```bash
npm run dev
# or: node index.js
```
Server runs on **http://localhost:3000**

> **Note**: `npm run dev` uses `nodemon`. Install globally (`npm i -g nodemon`) if you get "nodemon not found".

### 4. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```
Frontend runs on **http://localhost:5173**

### 5. Use the App
- Open http://localhost:5173
- Sign up as **Teacher** or **Student**
- Teachers: Create quizzes → Manage subscriptions
- Students: Subscribe to teachers → Attempt open quizzes

## 🔐 Environment Variables

**Server (`server/.env`)**

| Variable       | Description                        | Example                              |
|----------------|------------------------------------|--------------------------------------|
| DATABASE_URL   | MongoDB connection string          | mongodb://localhost:27017/quizzy     |
| JWT_SECRETS    | Secret for signing JWTs            | your-super-secret-key-here           |

No client environment variables required. API base URL is hardcoded to `http://localhost:3000/api` (update `client/src/api.js` if deploying elsewhere).

## 📁 Project Structure

```
Quizzy/
├── client/                          # Vite React frontend (:5173)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateQuiz/          # Quiz builder with live preview
│   │   │   ├── attemptQuiz/         # Taking quizzes + async result polling
│   │   │   ├── result/              # Teacher result viewer
│   │   │   └── Navbar/
│   │   ├── pages/
│   │   │   ├── Dashboard/           # Role-aware quiz list + stats + actions
│   │   │   ├── SubscribeTeachers/   # Student teacher discovery & requests
│   │   │   ├── ManageSubscriptions/ # Teacher pending approvals
│   │   │   ├── Login/, Signup/
│   │   ├── api.js
│   │   └── App.jsx                  # Routes + auth state
│   └── package.json
├── server/                          # Express API (:3000)
│   ├── config/
│   │   ├── database.js
│   │   └── kafka.js
│   ├── controllers/
│   │   ├── quizController.js
│   │   ├── subscriptionController.js
│   │   └── userController.js
│   ├── middlewares/auth.js          # JWT + role guards (cookie or Bearer)
│   ├── models/
│   │   ├── User.js
│   │   ├── Quiz.js                  # questions + responses embedded
│   │   └── Subscription.js
│   ├── routes/
│   ├── services/producer.js         # Kafka publish + in-memory pending tracker
│   ├── worker/gradingWorker.js      # Kafka consumer + scoring logic
│   └── index.js                     # App bootstrap + graceful shutdown
├── docker-compose.yml
├── README.md
└── .gitignore
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` — Register (name, email, password, role: "Student"|"Teacher")
- `POST /api/auth/login` — Login (sets httpOnly cookie + returns token)
- `GET /api/auth/teachers` — (auth) List teachers

### Quizzes
- `POST /api/quiz/create` — (teacher) Create quiz `{title, questions: [{title, answer[], correctIndex, marks}], isOpen?}`
- `GET /api/quiz/` — (auth) Get visible quizzes (teachers: own; students: from approved teachers)
- `GET /api/quiz/:id` — (auth) Get quiz + user's submission status/score
- `POST /api/quiz/:id/submit` — (student) Submit answers → async processing (202)
- `PATCH /api/quiz/:id/toggle-status` — (teacher) Open/close quiz

### Subscriptions
- `POST /api/subscription/request` — (student) `{teacherId}`
- `GET /api/subscription/requests` — (teacher) Pending requests
- `POST /api/subscription/respond` — (teacher) `{subscriptionId, action: "approve"|"reject"}`
- `GET /api/subscription/my` — (student) Your subscriptions

## 👥 User Roles & Workflows

**Teacher**
1. Sign up → Dashboard shows your quizzes + pending requests count
2. Create quiz → optionally open immediately
3. Students request sub → approve via /manage-subscriptions
4. Students can now see & attempt your open quizzes
5. View results per quiz

**Student**
1. Sign up → Dashboard empty until you subscribe
2. Go to Subscriptions → request teachers
3. Once approved → quizzes appear in Dashboard
4. Attempt open quizzes → get score after background grading

## 🧪 Development Tips

- **Reset data**: Drop the `quizzy` database in MongoDB
- **Kafka issues**: Ensure `docker-compose up -d` succeeded and `localhost:9092` reachable
- **Token location**: Stored in `localStorage` (key: `token`). Logout clears it
- **Styling**: Heavy use of custom CSS in `App.css` + component CSS files (Bootstrap classes mixed in)
- **Hot reload**: Both Vite and nodemon provide it
- **Production**: Build client (`npm run build`), serve static or use proxy; ensure Kafka/Mongo reachable

## 📞 Support & Contributing

Open an issue or pull request on the repository.

---
