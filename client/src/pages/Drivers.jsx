import { useState } from "react";

import PageHeader from "../components/PageHeader";
import SearchBar from "../components/SearchBar";
import DriverTable from "../components/DriverTable";
import AddDriverModal from "../components/AddDriverModal";

function Drivers() {

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const drivers = [

    {
      id: 1,
      name: "Rahul",
      license: "DL123456",
      phone: "9876543210",
      status: "Available",
    },

    {
      id: 2,
      name: "Ramesh",
      license: "DL789456",
      phone: "9988776655",
      status: "On Trip",
    },

    {
      id: 3,
      name: "Suresh",
      license: "DL654987",
      phone: "9123456780",
      status: "Inactive",
    },

  ];

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <div>

      <PageHeader
        title="Driver Management"
        buttonText="+ Add Driver"
        onClick={() => setShowModal(true)}
      />

      <SearchBar
        search={search}
        setSearch={setSearch}
      />

      <DriverTable drivers={filteredDrivers} />

      {showModal && (
        <div className="mt-6">
          <AddDriverModal />
        </div>
      )}

    </div>

  );
}

export default Drivers;