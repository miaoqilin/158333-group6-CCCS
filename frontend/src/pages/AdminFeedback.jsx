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

function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);

  const fetchFeedback = async () => {
    const { data } = await api.get("/feedback/admin/all");
    setFeedback(data);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const deleteFeedback = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;

    await api.delete(`/feedback/admin/${id}`);
    fetchFeedback();
  };

  return (
    <DashboardLayout title="Admin Panel" links={links}>
      <h2>Feedback Overview</h2>

      <div className="stack">
        {feedback.map((f) => (
          <div className="card" key={f._id}>
            <div className="card-header-row">
              <h3>{f.menuItem?.name}</h3>
              <span className="badge accent">{f.rating} Stars</span>
            </div>

            <p>{f.comment || "No comment"}</p>
            <p className="small">Customer: {f.user?.name}</p>
            <p className="small">Vendor: {f.vendor?.businessName || f.vendor?.name}</p>
            <p className="small">Sentiment: {f.sentiment}</p>

            <button className="danger-btn" onClick={() => deleteFeedback(f._id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default AdminFeedback;