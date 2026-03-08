import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../AuthContext";
import "../admin-ui.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [token]);

  return (
    <div className="admin-ui-page">
      <div className="admin-ui-container">
        <div className="admin-ui-title-row">
          <div>
            <h2 className="admin-ui-title">Manage Users</h2>
            <p className="admin-ui-subtitle">View users, roles, and registration timeline.</p>
          </div>
          <span className="admin-ui-pill">Total: {users.length}</span>
        </div>

        <div className="admin-ui-panel admin-ui-panel-pad admin-ui-table-wrap">
          <table className="admin-ui-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th className="admin-ui-hide-sm">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u) => {
                  const isAdmin = String(u.role || "").toLowerCase() === "admin";
                  return (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td style={{ textTransform: "capitalize" }}>{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className={
                            isAdmin
                              ? "admin-ui-badge admin-ui-badge-success"
                              : "admin-ui-badge admin-ui-badge-warn"
                          }
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="admin-ui-hide-sm">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="admin-ui-empty">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
