import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./AuthPortal.css";

const initialAuthForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "Student",
};

const AuthPortal = ({ setLoginUser, initialMode = "login" }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(initialAuthForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setAuthMode = (nextMode) => {
    setMode(nextMode);
    setFeedback({ type: "", message: "" });
  };

  const login = async () => {
    if (!form.email || !form.password) {
      setFeedback({ type: "error", message: "Email and password are required." });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email: form.email,
        password: form.password,
      });

      const token = response?.data?.token;
      if (!token) {
        setFeedback({ type: "error", message: "Unable to login. Please try again." });
        return;
      }

      localStorage.setItem("token", token);
      const user = jwtDecode(token);

      setLoginUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

      navigate("/dashboard");
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Invalid credentials.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const signup = async () => {
    const { name, email, password, confirmPassword, role } = form;

    if (!name || !email || !password || !confirmPassword) {
      setFeedback({ type: "error", message: "Please fill all fields." });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      await axios.post("http://localhost:3000/api/auth/signup", {
        name,
        email,
        password,
        role,
      });

      setFeedback({
        type: "success",
        message: "Account created. Please login to continue.",
      });

      setMode("login");
      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Registration failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAuth = (event) => {
    event.preventDefault();
    if (mode === "login") {
      login();
      return;
    }
    signup();
  };

  return (
    <div className="auth-portal">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-chip">Quizzy Platform</span>
          <h1>Dashboard Access</h1>
          <p>Secure login and signup for both students and teachers.</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            type="button"
            onClick={() => setAuthMode("login")}
          >
            Login
          </button>
          <button
            className={`auth-tab ${mode === "signup" ? "active" : ""}`}
            type="button"
            onClick={() => setAuthMode("signup")}
          >
            Signup
          </button>
        </div>

        <form className="auth-form" onSubmit={submitAuth}>
          {mode === "signup" && (
            <label className="auth-field">
              <span>Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                autoComplete="name"
              />
            </label>
          )}

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              autoComplete="email"
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>

          {mode === "signup" && (
            <>
              <label className="auth-field">
                <span>Confirm Password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
              </label>

              <label className="auth-field">
                <span>Account Type</span>
                <select name="role" value={form.role} onChange={handleInputChange}>
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                </select>
              </label>
            </>
          )}

          {feedback.message ? (
            <div className={`auth-feedback ${feedback.type}`}>{feedback.message}</div>
          ) : null}

          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : mode === "login" ? "Enter Dashboard" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPortal;
