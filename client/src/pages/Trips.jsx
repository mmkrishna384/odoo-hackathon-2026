import { useState } from "react";

import PageHeader from "../components/PageHeader";
import SearchBar from "../components/SearchBar";
import TripTable from "../components/TripTable";
import AddTripModal from "../components/AddTripModal";

function Trips() {

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const trips = [

    {
      id: "TR001",
      vehicle: "Tata Ace",
      driver: "Rahul",
      source: "Hyderabad",
      destination: "Vijayawada",
      status: "On Trip",
    },

    {
      id: "TR002",
      vehicle: "Ashok Leyland",
      driver: "Ramesh",
      source: "Guntur",
      destination: "Chennai",
      status: "Completed",
    },

    {
      id: "TR003",
      vehicle: "Bolero Pickup",
      driver: "Suresh",
      source: "Bangalore",
      destination: "Mysore",
      status: "Pending",
    },

  ];

  const filteredTrips = trips.filter((trip) =>
    trip.vehicle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>

      <PageHeader
        title="Trip Management"
        buttonText="+ Create Trip"
        onClick={() => setShowModal(true)}
      />

      <SearchBar
        search={search}
        setSearch={setSearch}
      />

      <TripTable trips={filteredTrips} />

      {showModal && (
        <div className="mt-6">
          <AddTripModal />
        </div>
      )}

    </div>
  );
}

export default Trips;