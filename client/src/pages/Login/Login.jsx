import React, { useState } from "react";
import "./Login.css";
import { toast } from "react-toastify";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Login = ({ setLoginUser }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const login = async (e) => {
    e?.preventDefault();
    if (!form.email || !form.password) {
      toast.warning("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      const token = res.data.token;
      if (token) {
        localStorage.setItem("token", token);
        const decoded = jwtDecode(token);
        setLoginUser({ id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role });
        toast.success("Welcome back!");
        navigate("/");
      } else {
        toast.error("Invalid credentials");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-stripe" />
        <div className="login-card-body">
          <h1>Sign In</h1>
          <p className="subtitle">Access your Quizzy workspace</p>
          <form className="login-form" onSubmit={login}>
            <div>
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <div className="login-divider">or</div>
          <button className="login-alt-btn" onClick={() => navigate("/register")}>
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
