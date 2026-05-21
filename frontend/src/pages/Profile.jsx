import { useEffect, useState } from "react";
import api from "../services/api";
import { updateStoredUserProfile } from "../utils/auth";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/auth/profile");
      setProfile(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const changeHandler = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const deliveryChangeHandler = (e) => {
    setProfile({
      ...profile,
      deliveryPreferences: {
        ...profile.deliveryPreferences,
        [e.target.name]: e.target.value,
      },
    });
  };

  const saveHandler = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const { data } = await api.put("/auth/profile", {
        name: profile.name,
        phone: profile.phone,
        defaultOrderNote: profile.defaultOrderNote,
        deliveryPreferences: profile.deliveryPreferences,
      });

      updateStoredUserProfile(data);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  if (!profile) {
    return <div className="page">Loading...</div>;
  }

  const availableCoupons = profile.coupons?.filter((c) => !c.isUsed) || [];

  return (
    <div className="page narrow">
      <div className="card">
        <h2>Profile</h2>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <form className="form" onSubmit={saveHandler}>
          <label>Name</label>
          <input name="name" value={profile.name || ""} onChange={changeHandler} />

          <label>Email</label>
          <input value={profile.email || ""} disabled />

          <label>Phone</label>
          <input name="phone" value={profile.phone || ""} onChange={changeHandler} />

          <label>Default Order Note</label>
          <textarea
            name="defaultOrderNote"
            value={profile.defaultOrderNote || ""}
            onChange={changeHandler}
          />

          <label>Default Delivery Address</label>
          <input
            name="defaultAddress"
            value={profile.deliveryPreferences?.defaultAddress || ""}
            onChange={deliveryChangeHandler}
          />

          <label>Default Delivery Time</label>
          <input
            name="defaultDeliveryTime"
            value={profile.deliveryPreferences?.defaultDeliveryTime || ""}
            onChange={deliveryChangeHandler}
          />

          <button className="primary-btn full">Save Profile</button>
        </form>

        <div className="profile-stats">
          <div>
            <strong>${Number(profile.totalSpent || 0).toFixed(2)}</strong>
            <span>Total Spent</span>
          </div>
          <div>
            <strong>{availableCoupons.length}</strong>
            <span>Available Coupons</span>
          </div>
          <div>
            <strong>{profile.loyaltyPoints || 0}</strong>
            <span>Loyalty Points</span>
          </div>
        </div>

        <h3>Customer Tags</h3>
        <div className="badge-row">
          {profile.customerTags?.length > 0 ? (
            profile.customerTags.map((tag) => (
              <span className="badge accent" key={tag}>
                {tag}
              </span>
            ))
          ) : (
            <p className="muted">No tags yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;