function VehicleTable({ vehicles }) {
  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">

      <table className="w-full">

        <thead className="bg-blue-600 text-white">

          <tr>

            <th className="p-4">Registration</th>

            <th>Model</th>

            <th>Capacity</th>

            <th>Status</th>

            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {vehicles.map((vehicle) => (

            <tr
              key={vehicle.id}
              className="border-b hover:bg-gray-100"
            >

              <td className="p-4">
                {vehicle.registration}
              </td>

              <td>{vehicle.model}</td>

              <td>{vehicle.capacity}</td>

              <td>

                <span
                  className={`px-3 py-1 rounded-full text-white
                  ${
                    vehicle.status === "Available"
                      ? "bg-green-500"
                      : vehicle.status === "On Trip"
                      ? "bg-blue-500"
                      : "bg-red-500"
                  }`}
                >
                  {vehicle.status}
                </span>

              </td>

              <td>

                <button className="bg-yellow-500 px-3 py-1 rounded text-white mr-2">
                  Edit
                </button>

                <button className="bg-red-500 px-3 py-1 rounded text-white">
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

export default VehicleTable;    