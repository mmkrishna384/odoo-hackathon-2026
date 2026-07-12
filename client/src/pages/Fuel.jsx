import { useState } from "react";
import PageHeader from "../components/PageHeader";
import SearchBar from "../components/SearchBar";

function Fuel() {
  const [search, setSearch] = useState("");

  const fuelLogs = [
    {
      id: 1,
      vehicle: "Tata Ace",
      liters: 45,
      cost: 3200,
      date: "12-07-2026",
    },
    {
      id: 2,
      vehicle: "Ashok Leyland",
      liters: 80,
      cost: 6500,
      date: "13-07-2026",
    },
    {
      id: 3,
      vehicle: "Bolero Pickup",
      liters: 35,
      cost: 2600,
      date: "13-07-2026",
    },
  ];

  const filtered = fuelLogs.filter((item) =>
    item.vehicle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Fuel & Expense Management"
        buttonText="+ Add Fuel Log"
      />

      <SearchBar search={search} setSearch={setSearch} />

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-4">Vehicle</th>
              <th>Liters</th>
              <th>Cost</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((fuel) => (
              <tr key={fuel.id} className="border-b hover:bg-gray-100">
                <td className="p-4">{fuel.vehicle}</td>
                <td>{fuel.liters} L</td>
                <td>₹ {fuel.cost}</td>
                <td>{fuel.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Fuel;