import { useState } from "react";
import PageHeader from "../components/PageHeader";
import SearchBar from "../components/SearchBar";
import VehicleTable from "../components/VehicleTable";
import AddVehicleModal from "../components/AddVehicleModal";

function Vehicles() {

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const vehicles = [
    {
      id: 1,
      registration: "AP39AB1234",
      model: "Tata Ace",
      capacity: "1000 KG",
      status: "Available",
    },
    {
      id: 2,
      registration: "AP39XY5678",
      model: "Ashok Leyland",
      capacity: "5000 KG",
      status: "On Trip",
    },
    {
      id: 3,
      registration: "TS09CD1122",
      model: "Eicher",
      capacity: "3000 KG",
      status: "Maintenance",
    },
  ];

  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.registration.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>

      <PageHeader
        title="Vehicle Management"
        buttonText="+ Add Vehicle"
        onClick={() => setShowModal(true)}
      />

      <SearchBar
        search={search}
        setSearch={setSearch}
      />

      <VehicleTable vehicles={filteredVehicles} />

      {showModal && (
        <div className="mt-6">
          <AddVehicleModal />
        </div>
      )}

    </div>
  );
}

export default Vehicles;