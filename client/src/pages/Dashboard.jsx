import DashboardCard from "../components/DashboardCard";
import RecentTrips from "../components/RecentTrips";

function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-5">

        <DashboardCard
          title="Active Vehicles"
          value="42"
          color="#3B82F6"
        />

        <DashboardCard
          title="Available Drivers"
          value="18"
          color="#10B981"
        />

        <DashboardCard
          title="Trips Today"
          value="12"
          color="#F59E0B"
        />

        <DashboardCard
          title="Fuel Cost"
          value="₹24,000"
          color="#EF4444"
        />

      </div>

      <RecentTrips />

    </div>
  );
}

export default Dashboard;