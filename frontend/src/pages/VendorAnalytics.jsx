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

function VendorAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [ai, setAi] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    api.get("/orders/vendor/analytics").then((res) => setAnalytics(res.data));
  }, []);

  const loadAiAnalysis = async () => {
    try {
      setLoadingAi(true);
      const { data } = await api.get("/ai/vendor/analysis");
      setAi(data);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <DashboardLayout title="Vendor Panel" links={links}>
      <h2>Sales Analytics</h2>

      {!analytics ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid four">
            <div className="stat-card">
              <strong>{analytics.totalOrders}</strong>
              <span>Total Orders</span>
            </div>
            <div className="stat-card">
              <strong>{analytics.totalQuantitySold}</strong>
              <span>Items Sold</span>
            </div>
            <div className="stat-card">
              <strong>${Number(analytics.totalRevenue).toFixed(2)}</strong>
              <span>Revenue</span>
            </div>
            <div className="stat-card">
              <strong>{analytics.bestSeller?.name || "N/A"}</strong>
              <span>Best Seller</span>
            </div>
          </div>

          <div className="card">
            <h3>Item Sales</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Dietary</th>
                    <th>Quantity</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.itemSales.map((item) => (
                    <tr key={item.menuItem}>
                      <td>{item.name}</td>
                      <td>{item.itemType}</td>
                      <td>{item.dietaryCategory}</td>
                      <td>{item.totalQty}</td>
                      <td>${Number(item.totalRevenue).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button className="primary-btn" onClick={loadAiAnalysis}>
            {loadingAi ? "Analyzing..." : "Generate AI Business Analysis"}
          </button>

          {ai && (
            <div className="card ai-box">
              <h3>AI Restaurant Business Analysis</h3>
              {ai.aiAnalysis ? (
                <pre>{ai.aiAnalysis}</pre>
              ) : (
                <p>{ai.message || "No AI analysis available."}</p>
              )}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export default VendorAnalytics;