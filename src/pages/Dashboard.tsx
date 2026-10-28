
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>♻ EcoConnect</h1>
        <p>Welcome to your Eco Dashboard!</p>
      </header>

      <nav className="dashboard-nav">
        <Link to="/">Home</Link>
        <Link to="/pickup-requests">Pickup Requests</Link>
        <Link to="/rewards">Rewards</Link>
        <Link to="/profile">Profile</Link>
      </nav>

      <main className="dashboard-content">
        <h2>My Dashboard</h2>
        <p>Track your recycling progress and environmental impact.</p>

        <div className="stats-grid">
          <article className="stat-card">
            <h3>🌿 Recycled Waste</h3>
            <p className="stat-number">0 KG</p>
            <span>Total recycled weight</span>
          </article>

          <article className="stat-card">
            <h3>⭐ Eco-Points</h3>
            <p className="stat-number">0</p>
            <span>Available points</span>
          </article>

          <article className="stat-card">
            <h3>🚛 Pickup Requests</h3>
            <p className="stat-number">0</p>
            <span>Total requests</span>
          </article>

          <article className="stat-card">
            <h3>♻ Completed</h3>
            <p className="stat-number">0</p>
            <span>Completed collections</span>
          </article>
        </div>

        <section className="dashboard-panel">
          <h2>Get Started</h2>
          <p>Have recyclable waste? Request a collection today.</p>
          <Link to="/pickup-requests" className="btn">
            Create Pickup Request
          </Link>
        </section>

        <section className="dashboard-panel">
          <h2>My Rewards</h2>
          <p>Use your Eco-points to redeem eco-friendly products.</p>
          <Link to="/rewards" className="btn">
            Explore Rewards
          </Link>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
