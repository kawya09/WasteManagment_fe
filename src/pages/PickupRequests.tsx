
import { useState } from "react";

function PickupRequests() {
  const [wasteType, setWasteType] = useState("Plastic");
  const [weight, setWeight] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [requests, setRequests] = useState<
    {
      id: number;
      wasteType: string;
      weight: number;
      location: string;
      date: string;
      status: string;
    }[]
  >([]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setRequests((previous) => [
      ...previous,
      {
        id: Date.now(),
        wasteType,
        weight: Number(weight),
        location,
        date,
        status: "Pending",
      },
    ]);

    setWeight("");
    setLocation("");
    setDate("");
    alert("Demo pickup request created!");
  }

  return (
    <main className="page-container">
      <h1>🚛 Waste Pickup Requests</h1>
      <p>Request a collection for your recyclable waste.</p>

      <form className="request-form" onSubmit={handleSubmit}>
        <label>Waste Type</label>
        <select
          value={wasteType}
          onChange={(e) => setWasteType(e.target.value)}
        >
          <option>Plastic</option>
          <option>E-waste</option>
          <option>Glass</option>
          <option>Paper</option>
          <option>Metal</option>
        </select>

        <label>Estimated Weight (KG)</label>
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Enter weight in KG"
          required
        />

        <label>Pickup Location</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter your address"
          required
        />

        <label>Preferred Pickup Date</label>
        <input
          type="date"
          value={date}
          min={new Date().toLocaleDateString("en-CA")}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <button type="submit">Submit Request</button>
      </form>

      <section className="dashboard-panel">
        <h2>My Requests</h2>

        {requests.length === 0 ? (
          <p>No requests created in this session.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Waste</th>
                  <th>Weight</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.wasteType}</td>
                    <td>{request.weight} KG</td>
                    <td>{request.location}</td>
                    <td>{request.date}</td>
                    <td>{request.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default PickupRequests;
