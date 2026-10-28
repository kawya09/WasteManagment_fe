
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">
      <nav className="navbar">
        <h2>♻ EcoConnect</h2>
        <div>
          <Link to="/login">Login</Link>{" "}
          <Link to="/register">Register</Link>
        </div>
      </nav>

      <section className="hero">
        <h1>Recycle Today, Protect Tomorrow 🌱</h1>
        <p>
          Join our eco-friendly community. Recycle waste,
          earn Eco-points, and redeem exciting rewards.
        </p>

        <Link to="/register" className="btn">
          Get Started
        </Link>

        <div className="features">
          <div>
            <h3>♻ Smart Recycling</h3>
            <p>Request waste collection easily.</p>
          </div>

          <div>
            <h3>⭐ Eco-Points</h3>
            <p>Earn points for recycling waste.</p>
          </div>

          <div>
            <h3>🌍 Greener Planet</h3>
            <p>Help protect our environment.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
