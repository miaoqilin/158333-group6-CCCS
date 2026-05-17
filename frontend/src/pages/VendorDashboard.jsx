import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";

const vendorLinks = [
  { to: "/vendor", label: "Dashboard" },
  { to: "/vendor/items", label: "My Items" },
  { to: "/vendor/orders", label: "Orders" },
  { to: "/vendor/analytics", label: "Analytics" },
  { to: "/vendor/feedback", label: "Feedback" },
  { to: "/vendor/profile", label: "Profile" },
];

function VendorDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/vendor/dashboard").then((res) => setStats(res.data));
  }, []);

  return (
    <DashboardLayout title="Vendor Panel" links={vendorLinks}>
      <h2>Vendor Dashboard</h2>

      {!stats ? (
        <p>Loading...</p>
      ) : (
        <div className="grid four">
          <div className="stat-card">
            <strong>{stats.totalItems}</strong>
            <span>Total Items</span>
          </div>
          <div className="stat-card">
            <strong>{stats.pendingItems}</strong>
            <span>Pending Review</span>
          </div>
          <div className="stat-card">
            <strong>{stats.totalQuantitySold}</strong>
            <span>Items Sold</span>
          </div>
          <div className="stat-card">
            <strong>${Number(stats.totalRevenue).toFixed(2)}</strong>
            <span>Revenue</span>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default VendorDashboard;