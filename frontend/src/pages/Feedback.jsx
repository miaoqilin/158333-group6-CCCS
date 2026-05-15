import { useEffect, useState } from "react";
import api from "../services/api";

function Feedback() {
  const [orders, setOrders] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [form, setForm] = useState({
    orderId: "",
    menuItemId: "",
    rating: 5,
    comment: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedOrder = orders.find((order) => order._id === form.orderId);

  const fetchData = async () => {
    try {
      const [ordersRes, feedbackRes] = await Promise.all([
        api.get("/orders/my"),
        api.get("/feedback/my"),
      ]);

      setOrders(ordersRes.data);
      setMyFeedback(feedbackRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load feedback data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const changeHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      await api.post("/feedback", {
        orderId: form.orderId,
        menuItemId: form.menuItemId,
        rating: Number(form.rating),
        comment: form.comment,
      });

      setMessage("Feedback submitted.");
      setForm({
        orderId: "",
        menuItemId: "",
        rating: 5,
        comment: "",
      });

      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback");
    }
  };

  return (
    <div className="page">
      <div className="section-title">
        <h2>Feedback</h2>
        <p>Rate your ordered items and leave written feedback.</p>
      </div>

      <div className="grid two">
        <div className="card">
          <h3>Submit Feedback</h3>

          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          <form className="form" onSubmit={submitHandler}>
            <label>Order</label>
            <select name="orderId" value={form.orderId} onChange={changeHandler} required>
              <option value="">Select order</option>
              {orders.map((order) => (
                <option key={order._id} value={order._id}>
                  #{order._id.slice(-6)} · ${order.totalPrice}
                </option>
              ))}
            </select>

            <label>Menu Item</label>
            <select
              name="menuItemId"
              value={form.menuItemId}
              onChange={changeHandler}
              required
              disabled={!selectedOrder}
            >
              <option value="">Select item</option>
              {selectedOrder?.orderItems.map((item) => (
                <option key={item.menuItem._id || item.menuItem} value={item.menuItem._id || item.menuItem}>
                  {item.name}
                </option>
              ))}
            </select>

            <label>Rating</label>
            <select name="rating" value={form.rating} onChange={changeHandler}>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <label>Comment</label>
            <textarea name="comment" value={form.comment} onChange={changeHandler} />

            <button className="primary-btn full">Submit Feedback</button>
          </form>
        </div>

        <div className="card">
          <h3>My Feedback History</h3>

          {myFeedback.length === 0 ? (
            <p className="muted">No feedback submitted yet.</p>
          ) : (
            <div className="stack">
              {myFeedback.map((f) => (
                <div className="mini-card" key={f._id}>
                  <strong>{f.menuItem?.name}</strong>
                  <p>Rating: {"★".repeat(f.rating)}</p>
                  <p>{f.comment || "No comment"}</p>
                  {f.vendorReply && <p className="small">Vendor reply: {f.vendorReply}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Feedback;