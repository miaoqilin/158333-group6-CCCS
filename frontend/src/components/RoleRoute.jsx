import { Navigate } from "react-router-dom";
import { getUserInfo } from "../utils/auth";

function RoleRoute({ roles, children }) {
  const user = getUserInfo();

  if (!user?.token) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (user.role === "vendor" && user.vendorStatus !== "approved") {
    return (
      <div className="page narrow">
        <div className="card">
          <h2>Vendor account pending</h2>
          <p>Your vendor account is not approved yet. Please wait for admin approval.</p>
        </div>
      </div>
    );
  }

  return children;
}

export default RoleRoute;