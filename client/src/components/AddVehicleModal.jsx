function AddVehicleModal() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-6">
        Add Vehicle
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <input
          className="border p-3 rounded"
          placeholder="Registration Number"
        />

        <input
          className="border p-3 rounded"
          placeholder="Vehicle Model"
        />

        <input
          className="border p-3 rounded"
          placeholder="Capacity"
        />

        <select className="border p-3 rounded">

          <option>Available</option>

          <option>On Trip</option>

          <option>Maintenance</option>

        </select>

      </div>

      <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg">
        Save Vehicle
      </button>

    </div>
  );
}

export default AddVehicleModal;