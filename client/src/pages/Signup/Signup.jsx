import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import "./Signup.css";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    reEnterPassword: "",
    role: "Student",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  useEffect(() => {
    console.log(user);
  }, [user]);

  const register = async () => {
    const { name, email, password, reEnterPassword, role } = user;
    if (name && email && password && password === reEnterPassword && role) {
      try {
        const res = await axios.post(
          "http://localhost:3000/api/auth/signup",
          { name, email, password, role }
        );
        alert(res.data.message);
        navigate("/login");
      } catch (err) {
        console.log(err);
        alert(err.response?.data?.message || "Registration failed");
      }
    } else {
      alert("Please fill all fields correctly and ensure passwords match");
    }
  };

  return (
    <div className="box">
      <div className="register">
        <h1>Register</h1>
        <input
          type="text"
          name="name"
          value={user.name}
          placeholder="Your Name"
          onChange={handleChange}
        />
        <input
          type="text"
          name="email"
          value={user.email}
          placeholder="Your Email"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          value={user.password}
          placeholder="Your Password"
          onChange={handleChange}
        />
        <input
          type="password"
          name="reEnterPassword"
          value={user.reEnterPassword}
          placeholder="Re-Enter Password"
          onChange={handleChange}
        />
        <select
          name="role"
          value={user.role}
          onChange={handleChange}
          style={{
            borderRadius: '8px',
            border: '2px solid #dddfe2',
            outline: 'none',
            color: '#1d2129',
            margin: '0.5rem 0',
            padding: '0.5rem 0.75rem',
            width: '100%',
            fontSize: '1rem',
          }}
        >
          <option value="Student">Student</option>
          <option value="Teacher">Teacher</option>
        </select>
        <div className="button" onClick={register}>
          Register
        </div>
        <div>or</div>
        <div
          className="button"
          onClick={() => {
            navigate("/login");
          }}
        >
          Login
        </div>
      </div>
    </div>
  );
};

export default Register;
