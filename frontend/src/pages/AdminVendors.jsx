import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";

const links = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/vendors", label: "Vendors" },
  { to: "/admin/menu-review", label: "Menu Review" },
  { to: "/admin/menu", label: "Menu Manage" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/feedback", label: "Feedback" },
];

function AdminVendors() {
  const [vendors, setVendors] = useState([]);

  const fetchVendors = async () => {
    const { data } = await api.get("/admin/vendors");
    setVendors(data);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const approve = async (id) => {
    await api.put(`/admin/vendors/${id}/approve`);
    fetchVendors();
  };

  const reject = async (id) => {
    const reason = window.prompt("Reject reason:");
    await api.put(`/admin/vendors/${id}/reject`, {
      reason: reason || "Rejected by admin",
    });
    fetchVendors();
  };

  return (
    <DashboardLayout title="Admin Panel" links={links}>
      <h2>Vendor Management</h2>

      <div className="grid two">
        {vendors.map((vendor) => (
          <div className="card" key={vendor._id}>
            <div className="card-header-row">
              <h3>{vendor.businessName || vendor.name}</h3>
              <span className="badge accent">{vendor.vendorStatus}</span>
            </div>

            <p>{vendor.businessDescription || "No description"}</p>
            <p className="small">{vendor.email}</p>
            <p className="small">{vendor.businessAddress}</p>

            <div className="button-row">
              <button className="primary-btn" onClick={() => approve(vendor._id)}>
                Approve
              </button>
              <button className="danger-btn" onClick={() => reject(vendor._id)}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default AdminVendors;