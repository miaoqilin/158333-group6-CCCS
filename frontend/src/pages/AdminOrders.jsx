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

const statuses = ["paid", "preparing", "out_for_delivery", "delivered", "completed", "cancelled"];

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const { data } = await api.get("/orders/admin/all");
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    fetchOrders();
  };

  return (
    <DashboardLayout title="Admin Panel" links={links}>
      <h2>Order Management</h2>

      <div className="stack">
        {orders.map((order) => (
          <div className="card" key={order._id}>
            <div className="card-header-row">
              <h3>Order #{order._id.slice(-6)}</h3>
              <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <p className="small">Customer: {order.user?.name} · {order.user?.email}</p>
            <p className="small">Delivery: {order.deliveryTime} · {order.deliveryAddress}</p>
            <p className="small">Payment: {order.paymentMethod} · {order.paymentStatus}</p>

            <ul>
              {order.orderItems.map((item, index) => (
                <li key={index}>
                  {item.name} × {item.qty} — Vendor: {item.vendor?.businessName || item.vendor?.name}
                </li>
              ))}
            </ul>

            <strong>Total: ${Number(order.totalPrice).toFixed(2)}</strong>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default AdminOrders;