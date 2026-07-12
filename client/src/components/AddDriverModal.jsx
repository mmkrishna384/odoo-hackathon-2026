function AddDriverModal() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-5">
        Add Driver
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <input
          className="border rounded p-3"
          placeholder="Driver Name"
        />

        <input
          className="border rounded p-3"
          placeholder="License Number"
        />

        <input
          className="border rounded p-3"
          placeholder="Phone Number"
        />

        <select className="border rounded p-3">

          <option>Available</option>

          <option>On Trip</option>

          <option>Inactive</option>

        </select>

      </div>

      <button className="bg-blue-600 text-white px-5 py-2 rounded mt-6">
        Save Driver
      </button>

    </div>
  );
}

export default AddDriverModal;