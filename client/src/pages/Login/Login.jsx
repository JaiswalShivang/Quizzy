import React from "react";
import { useState, useEffect } from "react";
import "./Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

const Login = ({ user, setLoginUser }) => {
  const navigate = useNavigate();
  const [tempUser, setTempUser] = useState({
    email: "",
    password: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempUser({ ...tempUser, [name]: value });
  };

  useEffect(() => {
    console.log(tempUser);
  }, [tempUser]);

  const login = async () => {
    console.log("login clicked");
    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", tempUser);
      const token = res.data.token;
      if (token) {
        alert("Login successfull");
        localStorage.setItem("token", token);
        const User = jwtDecode(token);
        setLoginUser({
          id: User.id,
          name: User.name,
          email: User.email,
          role: User.role,
        });
        console.log("token: ", token);
        navigate("/");
      } else {
        alert("Invalid credentials");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="login">
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Enter your Email"
        name="email"
        value={tempUser.email}
        onChange={handleChange}
      />
      <input
        type="password"
        placeholder="Enter your Password"
        name="password"
        value={tempUser.password}
        onChange={handleChange}
      />
      <div className="button" onClick={login}>
        Login
      </div>
      <div>or</div>
      <div
        className="button"
        onClick={() => {
          navigate("/register");
        }}
      >
        Register
      </div>
    </div>
  );
};

export default Login;
