import PageHeader from "../components/PageHeader";

function Maintenance() {

  const maintenance = [
    {
      vehicle: "Tata Ace",
      issue: "Engine Oil Change",
      date: "12-07-2026",
      status: "Scheduled",
    },
    {
      vehicle: "Ashok Leyland",
      issue: "Brake Service",
      date: "14-07-2026",
      status: "Completed",
    },
  ];

  return (
    <div>

      <PageHeader
        title="Maintenance"
        buttonText="+ Schedule"
      />

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-blue-600 text-white">

            <tr>
              <th className="p-4">Vehicle</th>
              <th>Issue</th>
              <th>Date</th>
              <th>Status</th>
            </tr>

          </thead>

          <tbody>

            {maintenance.map((item, index) => (

              <tr key={index} className="border-b">

                <td className="p-4">{item.vehicle}</td>

                <td>{item.issue}</td>

                <td>{item.date}</td>

                <td>{item.status}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Maintenance;