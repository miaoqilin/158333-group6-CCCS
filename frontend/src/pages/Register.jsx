import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState("student");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    businessName: "",
    businessDescription: "",
    businessAddress: "",
    businessPhone: "",
  });

  const changeHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (accountType === "vendor") {
        await api.post("/auth/register-vendor", form);
        alert("Vendor registered. Please wait for admin approval.");
      } else {
        await api.post("/auth/register", form);
        alert("Registration successful.");
      }

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="page narrow">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p>Register as a customer or campus food vendor.</p>

        {error && <div className="alert error">{error}</div>}

        <div className="tabs">
          <button
            className={accountType === "student" ? "active" : ""}
            onClick={() => setAccountType("student")}
            type="button"
          >
            Customer
          </button>
          <button
            className={accountType === "vendor" ? "active" : ""}
            onClick={() => setAccountType("vendor")}
            type="button"
          >
            Vendor
          </button>
        </div>

        <form onSubmit={submitHandler} className="form">
          <label>Name</label>
          <input name="name" value={form.name} onChange={changeHandler} required />

          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={changeHandler}
            required
          />

          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={changeHandler}
            required
          />

          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={changeHandler} />

          {accountType === "vendor" && (
            <>
              <label>Business Name</label>
              <input
                name="businessName"
                value={form.businessName}
                onChange={changeHandler}
                required
              />

              <label>Business Description</label>
              <textarea
                name="businessDescription"
                value={form.businessDescription}
                onChange={changeHandler}
              />

              <label>Business Address</label>
              <input
                name="businessAddress"
                value={form.businessAddress}
                onChange={changeHandler}
              />

              <label>Business Phone</label>
              <input
                name="businessPhone"
                value={form.businessPhone}
                onChange={changeHandler}
              />
            </>
          )}

          <button className="primary-btn full" type="submit">
            Register
          </button>
        </form>

        <p className="muted center">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;