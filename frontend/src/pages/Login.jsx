import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { saveUserInfo } from "../utils/auth";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

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

      const { data } = await api.post("/auth/login", form);

      saveUserInfo(data);

      if (data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "vendor") {
        navigate("/vendor");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page narrow">
      <div className="auth-card">
        <h2>Login</h2>
        <p>Access your Campus Coffee account.</p>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={submitHandler} className="form">
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

          <button className="primary-btn full" type="submit">
            Login
          </button>
        </form>

        <p className="muted center">
          New user? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;