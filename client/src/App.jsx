import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./pages/Dashboard/Dashboard";
import CreateQuiz from "./components/CreateQuiz/CreateQuiz";
import AttemptQuiz from "./components/attemptQuiz/attemptQuiz";
import Result from "./components/result/result";
import SubscribeTeachers from "./pages/SubscribeTeachers/SubscribeTeachers";
import ManageSubscriptions from "./pages/ManageSubscriptions/ManageSubscriptions";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";


function App() {
  const [user, setLoginUser] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    try {
      const decodedUser = jwtDecode(token);
      if (!decodedUser) {
        localStorage.removeItem("token");
        setLoginUser({});
        return;
      }

      setLoginUser({
        id: decodedUser.id,
        name: decodedUser.name,
        email: decodedUser.email,
        role: decodedUser.role,
      });
    } catch {
      localStorage.removeItem("token");
      setLoginUser({});
    }
  }, []);

  return (
    <div>
      <Router>
        {user && user.id ? (
          <Navbar user={user} setLoginUser={setLoginUser} />
        ) : null}
        <div className="App" style={{ paddingTop: '1.5rem' }}>
          <Routes>
            <Route
              path="/"
              element={
                user && user.id ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login setLoginUser={setLoginUser} />
                )
              }
            />
            <Route
              path="/login"
              element={
                user && user.id ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login setLoginUser={setLoginUser} />
                )
              }
            />
            <Route
              path="/register"
              element={
                user && user.id ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Signup />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                user && user.id ? (
                  <Dashboard user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/createquiz"
              element={
                user && user.role === 'Teacher' ? (
                  <CreateQuiz user={user} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route
              path="/subscribe"
              element={
                user && user.role === 'Student' ? (
                  <SubscribeTeachers user={user} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route
              path="/manage-subscriptions"
              element={
                user && user.role === 'Teacher' ? (
                  <ManageSubscriptions />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route path="/quiz/:id" element={<AttemptQuiz user={user} />} />
            <Route path="/results/:id" element={<Result user={user} />} />
          </Routes>
        </div>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: '#1c2130',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          color: '#f1f5f9',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.9rem',
        }}
      />
    </div>
  );
}

export default App;
