import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";

const links = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/vendors", label: "Vendors" },
  { to: "/admin/menu-review", label: "Menu Review" },
  { to: "/admin/menu", label: "Menu Manage" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/feedback", label: "Feedback" },
];

function AdminUsers() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const { data } = await api.get("/admin/users");
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id, role) => {
    await api.put(`/admin/users/${id}/role`, { role });
    fetchUsers();
  };

  const toggleStatus = async (user) => {
    await api.put(`/admin/users/${user._id}/status`, {
      isActive: !user.isActive,
    });
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await api.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  return (
    <DashboardLayout title="Admin Panel" links={links}>
      <h2>User Management</h2>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Total Spent</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select value={user.role} onChange={(e) => updateRole(user._id, e.target.value)}>
                    <option value="student">student</option>
                    <option value="vendor">vendor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>{user.isActive ? "Active" : "Disabled"}</td>
                <td>${Number(user.totalSpent || 0).toFixed(2)}</td>
                <td>
                  <button className="secondary-btn" onClick={() => toggleStatus(user)}>
                    {user.isActive ? "Disable" : "Activate"}
                  </button>
                  <button className="danger-btn" onClick={() => deleteUser(user._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default AdminUsers;