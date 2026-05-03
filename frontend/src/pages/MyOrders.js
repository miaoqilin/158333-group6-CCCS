import { useEffect, useState } from "react";
import axios from "axios";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        if (!userInfo || !userInfo.token) {
          setError("Please login first.");
          setLoading(false);
          return;
        }

        const { data } = await axios.get(
          "http://localhost:5000/api/orders/my",
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );

        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>My Orders</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p>No orders found.</p>
      )}

      {orders.map((order) => (
        <div key={order._id} style={styles.card}>
          <div style={styles.row}>
            <strong>Order ID:</strong>
            <span>{order._id}</span>
          </div>

          <div style={styles.row}>
            <strong>Status:</strong>
            <span>{order.status}</span>
          </div>

          <div style={styles.row}>
            <strong>Total:</strong>
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>

          <div style={styles.row}>
            <strong>Items:</strong>
          </div>

          <ul>
            {order.orderItems.map((item, index) => (
              <li key={index}>
                {item.name} × {item.qty} (${item.price})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "auto",
    padding: "20px",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "15px",
    marginBottom: "15px",
    backgroundColor: "#fafafa",
  },
  row: {
    marginBottom: "8px",
  },
};

export default MyOrders;