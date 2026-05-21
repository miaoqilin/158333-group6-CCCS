import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Campus Coffee and Catering Services</p>
          <h1>Order coffee, meals, snacks and catering packages on campus.</h1>
          <p>
            A full online ordering platform for students, staff, visitors,
            campus clubs, vendors and administrators.
          </p>

          <div className="hero-actions">
            <Link to="/menu" className="primary-btn">
              Browse Menu
            </Link>
            <Link to="/register" className="secondary-btn">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <section className="page">
        <div className="section-title">
          <h2>Platform Features</h2>
          <p>Simple ordering, vendor management and admin control in one system.</p>
        </div>

        <div className="grid three">
          <div className="card">
            <h3>Online Menu</h3>
            <p>Browse coffee, drinks, desserts, meals and catering packages.</p>
          </div>

          <div className="card">
            <h3>Fast Payment</h3>
            <p>Simulated credit card, debit card, campus account and mobile wallet payment.</p>
          </div>

          <div className="card">
            <h3>Vendor Dashboard</h3>
            <p>Vendors can manage items, packages, orders, feedback and sales analytics.</p>
          </div>

          <div className="card">
            <h3>Admin Review</h3>
            <p>Admins can approve vendors, review menu items and manage users.</p>
          </div>

          <div className="card">
            <h3>Feedback System</h3>
            <p>Customers can rate items up to five stars and leave written feedback.</p>
          </div>

          <div className="card">
            <h3>Rewards</h3>
            <p>Customers can receive coupons and category tags based on ordering history.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;