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

function AdminMenuManage() {
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    const { data } = await api.get("/menu/admin/all");
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const toggle = async (id) => {
    await api.put(`/menu/admin/${id}/toggle`);
    fetchItems();
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;

    await api.delete(`/menu/${id}`);
    fetchItems();
  };

  const quickUpdate = async (item) => {
    const price = window.prompt("New price:", item.price);
    const description = window.prompt("New description:", item.description);

    await api.put(`/menu/${item._id}`, {
      price: Number(price),
      description,
    });

    fetchItems();
  };

  return (
    <DashboardLayout title="Admin Panel" links={links}>
      <h2>Menu Management</h2>

      <div className="grid two">
        {items.map((item) => (
          <div className="card" key={item._id}>
            <div className="card-header-row">
              <h3>{item.name}</h3>
              <span className="badge accent">{item.approvalStatus}</span>
            </div>

            <p>{item.description}</p>
            <p className="price">${Number(item.price).toFixed(2)}</p>
            <p className="small">
              Vendor: {item.vendor?.businessName || item.vendor?.name || "N/A"}
            </p>
            <p className="small">
              Available: {item.isAvailable ? "Yes" : "No"}
            </p>

            <div className="button-row">
              <button className="secondary-btn" onClick={() => quickUpdate(item)}>
                Edit Price/Description
              </button>
              <button className="secondary-btn" onClick={() => toggle(item._id)}>
                Toggle Available
              </button>
              <button className="danger-btn" onClick={() => deleteItem(item._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default AdminMenuManage;