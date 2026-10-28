
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CITIZEN");

  function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      alert("Please fill in all fields.");
      return;
    }

    alert("Demo registration successful! Connect a backend for real accounts.");
    navigate("/login");
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleRegister}>
        <h1>Join EcoConnect 🌱</h1>
        <p>Create your account</p>

        <label>Full Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          minLength={6}
          required
        />

        <label>Account Type</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="CITIZEN">Citizen</option>
          <option value="COLLECTOR">Waste Collector</option>
        </select>

        <button type="submit">Create Account</button>

        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
        <Link to="/">Back to Home</Link>
      </form>
    </div>
  );
}

export default Register;
