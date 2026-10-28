
import { useState } from "react";

const rewards = [
  { id: 1, name: "Eco Shopping Bag", points: 500, icon: "🛍️" },
  { id: 2, name: "Reusable Water Bottle", points: 800, icon: "🍃" },
  { id: 3, name: "Indoor Plant", points: 1200, icon: "🪴" },
  { id: 4, name: "Solar Lantern", points: 2000, icon: "🏮" },
];

function Rewards() {
  const [points, setPoints] = useState(1250);
  const [redeemed, setRedeemed] = useState<string[]>([]);

  function redeemReward(name: string, cost: number) {
    if (points < cost) {
      alert("You don't have enough Eco-points.");
      return;
    }

    setPoints((previous) => previous - cost);
    setRedeemed((previous) => [...previous, name]);
    alert(`Demo redemption successful: ${name}`);
  }

  return (
    <main className="page-container">
      <h1>🎁 Eco Rewards</h1>
      <p>Redeem eco-friendly products using your Eco-points.</p>

      <section className="points-banner">
        <h2>⭐ Your Balance</h2>
        <p>{points.toLocaleString()} Eco-points</p>
      </section>

      <div className="rewards-grid">
        {rewards.map((reward) => (
          <article className="reward-card" key={reward.id}>
            <div className="reward-icon">{reward.icon}</div>
            <h3>{reward.name}</h3>
            <p>{reward.points.toLocaleString()} Points</p>

            <button
              disabled={points < reward.points}
              onClick={() => redeemReward(reward.name, reward.points)}
            >
              {points < reward.points ? "Not Enough Points" : "Redeem"}
            </button>
          </article>
        ))}
      </div>

      {redeemed.length > 0 && (
        <section className="dashboard-panel">
          <h2>Redemption History</h2>
          {redeemed.map((name, index) => (
            <p key={`${name}-${index}`}>✓ {name}</p>
          ))}
        </section>
      )}
    </main>
  );
}

export default Rewards;
