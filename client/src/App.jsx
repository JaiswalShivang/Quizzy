import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import CreateQuiz from "./components/CreateQuiz/CreateQuiz";
import Signup from "./pages/Signup/Signup";
import AttemptQuiz from "./components/attemptQuiz/attemptQuiz";
import Result from "./components/result/result";
import SubscribeTeachers from "./pages/SubscribeTeachers/SubscribeTeachers";
import ManageSubscriptions from "./pages/ManageSubscriptions/ManageSubscriptions";


function App() {
  const [user, setLoginUser] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
  });
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("jwt token: ", token);
      const User = jwtDecode(token);
      if (!User) {
        localStorage.removeItem("token");
        setLoginUser({});
      } else {
        setLoginUser({
          id: User.id,
          name: User.name,
          email: User.email,
          role: User.role,
        });
        console.log("User from jwt: ", User);
        console.log("user of useState", user);
      }
    }
  }, []);
  return (
    <div>
      <Router>
        {user && user.id ? (
          <Navbar user={user} setLoginUser={setLoginUser} />
        ) : null}
        <div className="App">
          <Routes>
            <Route
              exact
              path="/"
              element={
                user && user.id ? (
                  <Home user={user} setLoginUser={setLoginUser} />
                ) : (
                  <Login user={user} setLoginUser={setLoginUser} />
                )
              }
            />
            <Route
              path="/login"
              element={<Login user={user} setLoginUser={setLoginUser} />}
            />
            <Route path="/register" element={<Signup />} />
            <Route
              path="/dashboard"
              element={<Dashboard user={user} setLoginUser={setLoginUser} />}
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
                  <ManageSubscriptions user={user} />
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
    </div>
  );
}

export default App;
