import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";
import "./Signup.css";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", reEnterPassword: "", role: "Student" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const register = async (e) => {
    e?.preventDefault();
    const { name, email, password, reEnterPassword, role } = form;
    if (!name || !email || !password || !role) {
      toast.warning("Please fill all fields");
      return;
    }
    if (password !== reEnterPassword) {
      toast.warning("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", { name, email, password, role });
      toast.success(res.data.message || "Account created!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-card-stripe" />
        <div className="signup-card-body">
          <h1>Create Account</h1>
          <p className="subtitle">Join Quizzy as a student or teacher</p>
          <form className="signup-form" onSubmit={register}>
            <div>
              <label className="form-label" htmlFor="name">Full Name</label>
              <input id="name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your name" autoComplete="name" />
            </div>
            <div>
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input id="reg-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div>
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" />
            </div>
            <div>
              <label className="form-label" htmlFor="re-password">Confirm Password</label>
              <input id="re-password" type="password" name="reEnterPassword" value={form.reEnterPassword} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" />
            </div>
            <div>
              <label className="form-label" htmlFor="role">I am a</label>
              <select id="role" name="role" value={form.role} onChange={handleChange} className="role-select">
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
              </select>
            </div>
            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
          <div className="signup-divider">or</div>
          <button className="signup-alt-btn" onClick={() => navigate("/login")}>
            Sign In Instead
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
