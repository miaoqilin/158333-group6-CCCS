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

function VendorProfile() {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/vendor/profile").then((res) => setProfile(res.data));
  }, []);

  const changeHandler = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    await api.put("/vendor/profile", profile);
    setMessage("Vendor profile updated.");
  };

  if (!profile) {
    return (
      <DashboardLayout title="Vendor Panel" links={links}>
        Loading...
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Vendor Panel" links={links}>
      <h2>Vendor Profile</h2>

      <div className="card narrow-card">
        {message && <div className="alert success">{message}</div>}

        <form className="form" onSubmit={submitHandler}>
          <label>Contact Name</label>
          <input name="name" value={profile.name || ""} onChange={changeHandler} />

          <label>Phone</label>
          <input name="phone" value={profile.phone || ""} onChange={changeHandler} />

          <label>Business Name</label>
          <input name="businessName" value={profile.businessName || ""} onChange={changeHandler} />

          <label>Business Description</label>
          <textarea
            name="businessDescription"
            value={profile.businessDescription || ""}
            onChange={changeHandler}
          />

          <label>Business Address</label>
          <input
            name="businessAddress"
            value={profile.businessAddress || ""}
            onChange={changeHandler}
          />

          <label>Business Phone</label>
          <input
            name="businessPhone"
            value={profile.businessPhone || ""}
            onChange={changeHandler}
          />

          <button className="primary-btn full">Save</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default VendorProfile;