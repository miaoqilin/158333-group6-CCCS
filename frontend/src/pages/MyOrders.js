import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders/my");
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="page">
      <div className="section-title">
        <h2>My Orders</h2>
        <p>View your order history, delivery details and payment status.</p>
      </div>

      {error && <div className="alert error">{error}</div>}

      {orders.length === 0 ? (
        <div className="card center">No orders found.</div>
      ) : (
        <div className="stack">
          {orders.map((order) => (
            <div className="card" key={order._id}>
              <div className="card-header-row">
                <h3>Order #{order._id.slice(-6)}</h3>
                <span className="badge accent">{order.status}</span>
              </div>

              <p className="small">Delivery Time: {order.deliveryTime}</p>
              <p className="small">Delivery Address: {order.deliveryAddress}</p>
              <p className="small">Payment: {order.paymentMethod} · {order.paymentStatus}</p>

              <ul>
                {order.orderItems.map((item, index) => (
                  <li key={index}>
                    {item.name} × {item.qty} — ${item.price}
                    {item.itemType === "package" && " (Package)"}
                  </li>
                ))}
              </ul>

              <div className="price-summary">
                <p>
                  <span>Subtotal</span>
                  <strong>${Number(order.subtotalPrice || order.totalPrice).toFixed(2)}</strong>
                </p>
                <p>
                  <span>Discount</span>
                  <strong>-${Number(order.discountAmount || 0).toFixed(2)}</strong>
                </p>
                <p className="total-line">
                  <span>Total</span>
                  <strong>${Number(order.totalPrice).toFixed(2)}</strong>
                </p>
              </div>

              <Link to="/feedback" className="secondary-btn">
                Leave Feedback
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;