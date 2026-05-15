import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";

const links = [
  { to: "/vendor", label: "Dashboard" },
  { to: "/vendor/items", label: "My Items" },
  { to: "/vendor/orders", label: "Orders" },
  { to: "/vendor/analytics", label: "Analytics" },
  { to: "/vendor/feedback", label: "Feedback" },
  { to: "/vendor/profile", label: "Profile" },
];

function VendorOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders/vendor/my").then((res) => setOrders(res.data));
  }, []);

  return (
    <DashboardLayout title="Vendor Panel" links={links}>
      <h2>Vendor Orders</h2>

      <div className="stack">
        {orders.map((order) => (
          <div className="card" key={order._id}>
            <div className="card-header-row">
              <h3>Order #{order._id.slice(-6)}</h3>
              <span className="badge accent">{order.status}</span>
            </div>

            <p className="small">Customer: {order.user?.name} · {order.user?.email}</p>
            <p className="small">Phone: {order.user?.phone || "N/A"}</p>
            <p className="small">Delivery Time: {order.deliveryTime}</p>
            <p className="small">Delivery Address: {order.deliveryAddress}</p>
            <p className="small">Order Note: {order.note || "None"}</p>

            <ul>
              {order.orderItems.map((item, index) => (
                <li key={index}>
                  {item.name} × {item.qty} — ${item.price}
                  {item.specialInstructions && ` — Note: ${item.specialInstructions}`}
                </li>
              ))}
            </ul>

            <strong>Vendor Subtotal: ${Number(order.vendorSubtotal || 0).toFixed(2)}</strong>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default VendorOrders;