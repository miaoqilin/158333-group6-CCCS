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

function VendorFeedback() {
  const [data, setData] = useState(null);

  const fetchFeedback = async () => {
    const res = await api.get("/feedback/vendor");
    setData(res.data);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const reply = async (id) => {
    const vendorReply = window.prompt("Reply to this feedback:");

    if (!vendorReply) return;

    await api.put(`/feedback/vendor/${id}/reply`, { vendorReply });
    fetchFeedback();
  };

  const handled = async (id) => {
    await api.put(`/feedback/${id}/handled`);
    fetchFeedback();
  };

  return (
    <DashboardLayout title="Vendor Panel" links={links}>
      <h2>Customer Feedback</h2>

      {!data ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid four">
            <div className="stat-card">
              <strong>{data.summary.total}</strong>
              <span>Total</span>
            </div>
            <div className="stat-card">
              <strong>{data.summary.averageRating}</strong>
              <span>Average Rating</span>
            </div>
            <div className="stat-card">
              <strong>{data.summary.positive}</strong>
              <span>Positive</span>
            </div>
            <div className="stat-card">
              <strong>{data.summary.negative}</strong>
              <span>Negative</span>
            </div>
          </div>

          <div className="stack">
            {data.feedback.map((f) => (
              <div className="card" key={f._id}>
                <div className="card-header-row">
                  <h3>{f.menuItem?.name}</h3>
                  <span className="badge accent">{f.rating} Stars</span>
                </div>

                <p>{f.comment || "No comment"}</p>
                <p className="small">Customer: {f.user?.name}</p>
                <p className="small">Delivery: {f.order?.deliveryTime} · {f.order?.deliveryAddress}</p>
                <p className="small">Sentiment: {f.sentiment}</p>
                <p className="small">Handled: {f.isHandled ? "Yes" : "No"}</p>

                {f.vendorReply && <p className="alert success">Reply: {f.vendorReply}</p>}

                <div className="button-row">
                  <button className="secondary-btn" onClick={() => reply(f._id)}>
                    Reply
                  </button>
                  <button className="secondary-btn" onClick={() => handled(f._id)}>
                    Mark Handled
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default VendorFeedback;