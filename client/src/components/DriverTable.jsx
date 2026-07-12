function DriverTable({ drivers }) {
  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">

      <table className="w-full">

        <thead className="bg-blue-600 text-white">

          <tr>
            <th className="p-4">Name</th>
            <th>License No</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>

        </thead>

        <tbody>

          {drivers.map((driver) => (

            <tr
              key={driver.id}
              className="border-b hover:bg-gray-100"
            >

              <td className="p-4">{driver.name}</td>

              <td>{driver.license}</td>

              <td>{driver.phone}</td>

              <td>

                <span
                  className={`px-3 py-1 rounded-full text-white
                    ${
                      driver.status === "Available"
                        ? "bg-green-500"
                        : driver.status === "On Trip"
                        ? "bg-blue-500"
                        : "bg-red-500"
                    }`}
                >
                  {driver.status}
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

export default DriverTable;