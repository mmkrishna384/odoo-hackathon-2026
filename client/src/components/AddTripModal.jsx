function AddTripModal() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-6">
        Create Trip
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <select className="border p-3 rounded">
          <option>Select Vehicle</option>
          <option>Tata Ace</option>
          <option>Ashok Leyland</option>
        </select>

        <select className="border p-3 rounded">
          <option>Select Driver</option>
          <option>Rahul</option>
          <option>Ramesh</option>
        </select>

        <input
          className="border p-3 rounded"
          placeholder="Source"
        />

        <input
          className="border p-3 rounded"
          placeholder="Destination"
        />

        <input
          className="border p-3 rounded"
          placeholder="Cargo Weight"
        />

        <input
          type="date"
          className="border p-3 rounded"
        />

      </div>

      <button className="bg-blue-600 text-white px-6 py-2 rounded mt-6">
        Assign Trip
      </button>

    </div>
  );
}

export default AddTripModal;