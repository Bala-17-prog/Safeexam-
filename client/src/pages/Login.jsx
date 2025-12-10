// client/src/pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? "/register" : "/login";

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth${endpoint}`,
        {
          username,
          password,
          role,
        }
      );

      if (isRegistering) {
        alert("✅ Registration successful! Please login.");
        setIsRegistering(false);
      } else {
        // Save session data
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userRole", res.data.role);
        localStorage.setItem("username", res.data.username);

        if (res.data.role === "admin") navigate("/admin");
        else navigate("/exam");
      }
    } catch (err) {
      console.error(err);
      alert(
        "❌ " +
          (err.response?.data?.message ||
            "Connection Error. Is the backend running?")
      );
    }
  };

  // --- Styles ---
  const glassInput = {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#fff",
    padding: "15px",
    borderRadius: "10px",
    width: "100%",
    marginBottom: "15px",
    outline: "none",
  };

  const optionStyle = { background: "#050505", color: "white" };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="glass-panel"
        style={{
          padding: "50px",
          maxWidth: "450px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#00f2ff", marginBottom: "10px" }}>
          {isRegistering ? "SYSTEM.INIT" : "ACCESS.PORTAL"}
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={glassInput}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={glassInput}
          />

          {isRegistering && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={glassInput}
            >
              <option style={optionStyle} value="student">
                Student
              </option>
              <option style={optionStyle} value="admin">
                Admin
              </option>
            </select>
          )}

          <button type="submit" className="neon-btn" style={{ width: "100%" }}>
            {isRegistering ? "REGISTER" : "LOGIN"}
          </button>
        </form>

        <p
          onClick={() => setIsRegistering(!isRegistering)}
          style={{
            color: "#00f2ff",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          {isRegistering ? "Login instead" : "Create Account"}
        </p>
      </div>
    </div>
  );
};

export default Login;
