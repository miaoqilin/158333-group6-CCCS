import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Menu from "../pages/Menu";
import Cart from "../pages/Cart";
import Profile from "../pages/Profile";

export default function AppRouter() {
  return (
    <BrowserRouter>
    
      <nav style={styles.nav}>
        <h2 style={styles.logo}>Campus Coffee</h2>

        <div style={styles.links}>
          <Link style={styles.link} to="/">Home</Link>
          <Link style={styles.link} to="/menu">Menu</Link>
          <Link style={styles.link} to="/cart">Cart</Link>
          <Link style={styles.link} to="/profile">Profile</Link>
          <Link style={styles.link} to="/login">Login</Link>
        </div>
      </nav>

     
      <div style={styles.container}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

//

//
const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    backgroundColor: "#333",
    color: "white",
  },
  logo: {
    margin: 0,
  },
  links: {
    display: "flex",
    gap: "20px",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
  },
  container: {
    padding: "20px",
  },
};