function TripTable({ trips }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="p-4">Trip ID</th>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>Source</th>
            <th>Destination</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {trips.map((trip) => (
            <tr key={trip.id} className="border-b hover:bg-gray-100">

              <td className="p-4">{trip.id}</td>

              <td>{trip.vehicle}</td>

              <td>{trip.driver}</td>

              <td>{trip.source}</td>

              <td>{trip.destination}</td>

              <td>
                <span
                  className={`px-3 py-1 rounded-full text-white ${
                    trip.status === "On Trip"
                      ? "bg-blue-500"
                      : trip.status === "Completed"
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                >
                  {trip.status}
                </span>
              </td>

              <td>

                <button className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">
                  Edit
                </button>

                <button className="bg-red-500 text-white px-3 py-1 rounded">
                  Delete
                </button>

              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

export default TripTable;