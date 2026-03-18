import { Link } from 'react-router-dom';

function Navbar() {
  const style = {
    display: 'flex',
    gap: '20px',
    padding: '16px 24px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #ddd'
  };

  return (
    <nav style={style}>
      <Link to="/">Home</Link>
      <Link to="/login">Login</Link>
      <Link to="/menu">Menu</Link>
      <Link to="/cart">Cart</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  );
}

export default Navbar;