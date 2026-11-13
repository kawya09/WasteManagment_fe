
import { useState } from "react";
import { Link } from "react-router-dom";

function Profile() {
  const [name, setName] = useState("Eco Citizen");
  const [email, setEmail] = useState("citizen@example.com");
  const [role, setRole] = useState("Citizen");
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(true);
  }

  return (
    <main className="page-container">
      <h1>👤 My Profile</h1>
      <p>Manage your EcoConnect account details.</p>

      <form className="auth-card" onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Account Type</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option>Citizen</option>
          <option>Collector</option>
        </select>

        <button type="submit">Save Profile</button>

        {saved && <p>Profile saved for this session.</p>}
      </form>

      <section className="dashboard-panel">
        <h2>My Eco Activity</h2>
        <p>Total Recycled Waste: 0 KG</p>
        <p>Available Eco-points: 0</p>
        <Link to="/dashboard">Back to Dashboard</Link>
      </section>
    </main>
  );
}

export default Profile;
