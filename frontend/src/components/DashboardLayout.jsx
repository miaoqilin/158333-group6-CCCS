import { Link } from "react-router-dom";

function DashboardLayout({ title, links, children }) {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h3>{title}</h3>

        <div className="sidebar-links">
          {links.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>
      </aside>

      <main className="dashboard-main">{children}</main>
    </div>
  );
}

export default DashboardLayout;