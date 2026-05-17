import { Link, useNavigate } from "react-router-dom";
import { getUserInfo, logoutUser } from "../utils/auth";

function Navbar() {
  const navigate = useNavigate();
  const user = getUserInfo();

  const logoutHandler = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        Campus Coffee
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/menu">Menu</Link>
        <Link to="/cart">Cart</Link>

        {user?.token && <Link to="/orders">My Orders</Link>}
        {user?.token && <Link to="/profile">Profile</Link>}
        {user?.token && <Link to="/feedback">My Feedback</Link>}

        {user?.role === "vendor" && user?.vendorStatus === "approved" && (
          <Link to="/vendor">Vendor Panel</Link>
        )}

        {user?.role === "admin" && <Link to="/admin">Admin Panel</Link>}

        {!user?.token ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="nav-button">
              Register
            </Link>
          </>
        ) : (
          <button className="nav-button" onClick={logoutHandler}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;