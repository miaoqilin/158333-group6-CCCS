import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";

const adminLinks = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/vendors", label: "Vendors" },
  { to: "/admin/menu-review", label: "Menu Review" },
  { to: "/admin/menu", label: "Menu Manage" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/feedback", label: "Feedback" },
];

function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => setStats(res.data));
  }, []);

  return (
    <DashboardLayout title="Admin Panel" links={adminLinks}>
      <h2>Admin Dashboard</h2>

      {!stats ? (
        <p>Loading...</p>
      ) : (
        <div className="grid four">
          <div className="stat-card">
            <strong>{stats.totalUsers}</strong>
            <span>Total Users</span>
          </div>
          <div className="stat-card">
            <strong>{stats.totalVendors}</strong>
            <span>Vendors</span>
          </div>
          <div className="stat-card">
            <strong>{stats.pendingMenuItems}</strong>
            <span>Pending Items</span>
          </div>
          <div className="stat-card">
            <strong>${Number(stats.totalSales).toFixed(2)}</strong>
            <span>Total Sales</span>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default AdminDashboard;