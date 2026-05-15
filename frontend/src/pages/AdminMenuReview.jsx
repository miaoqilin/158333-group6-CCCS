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

function AdminMenuReview() {
  const [items, setItems] = useState([]);

  const fetchPending = async () => {
    const { data } = await api.get("/menu/admin/pending");
    setItems(data);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approve = async (id) => {
    await api.put(`/menu/admin/${id}/approve`);
    fetchPending();
  };

  const reject = async (id) => {
    const rejectionReason = window.prompt("Reject reason:");
    await api.put(`/menu/admin/${id}/reject`, {
      rejectionReason: rejectionReason || "Rejected by admin",
    });
    fetchPending();
  };

  return (
    <DashboardLayout title="Admin Panel" links={links}>
      <h2>Menu Review</h2>

      {items.length === 0 ? (
        <div className="card center">No pending menu items.</div>
      ) : (
        <div className="grid two">
          {items.map((item) => (
            <div className="card" key={item._id}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>

              <div className="badge-row">
                <span className="badge">{item.category}</span>
                <span className="badge">{item.dietaryCategory}</span>
                <span className="badge accent">{item.itemType}</span>
              </div>

              <p className="small">Vendor: {item.vendor?.businessName || "N/A"}</p>
              <p className="price">${Number(item.price).toFixed(2)}</p>

              {item.itemType === "package" && (
                <ul>
                  {item.packageItems.map((p, index) => (
                    <li key={index}>
                      {p.name} × {p.quantity}
                    </li>
                  ))}
                </ul>
              )}

              <div className="button-row">
                <button className="primary-btn" onClick={() => approve(item._id)}>
                  Approve
                </button>
                <button className="danger-btn" onClick={() => reject(item._id)}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default AdminMenuReview;