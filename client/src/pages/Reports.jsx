function Reports() {
  return (
    <div>

      <h1 className="text-3xl font-bold mb-6">
        Reports & Analytics
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-gray-500">Fleet Utilization</h3>
          <p className="text-3xl font-bold mt-3">82%</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-gray-500">Completed Trips</h3>
          <p className="text-3xl font-bold mt-3">284</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-gray-500">Fuel Cost</h3>
          <p className="text-3xl font-bold mt-3">₹1.25 Lakh</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-gray-500">Maintenance Cost</h3>
          <p className="text-3xl font-bold mt-3">₹38,000</p>
        </div>

      </div>

      <div className="bg-white shadow rounded-xl mt-8 p-8 h-96 flex items-center justify-center">
        <h2 className="text-gray-500 text-xl">
          Charts will be displayed here
        </h2>
      </div>

    </div>
  );
}

export default Reports;