function RecentTrips() {
  const trips = [
    {
      id: "TR001",
      vehicle: "Tata Ace",
      driver: "Rahul",
      status: "On Trip",
    },
    {
      id: "TR002",
      vehicle: "Ashok Leyland",
      driver: "Ramesh",
      status: "Completed",
    },
    {
      id: "TR003",
      vehicle: "Mahindra Bolero",
      driver: "Suresh",
      status: "Pending",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-5 mt-8">
      <h2 className="text-xl font-semibold mb-4">Recent Trips</h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Trip ID</th>
            <th className="text-left p-2">Vehicle</th>
            <th className="text-left p-2">Driver</th>
            <th className="text-left p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {trips.map((trip) => (
            <tr key={trip.id} className="border-b">
              <td className="p-2">{trip.id}</td>
              <td className="p-2">{trip.vehicle}</td>
              <td className="p-2">{trip.driver}</td>
              <td className="p-2">{trip.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentTrips;