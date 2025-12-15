
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = "http://localhost:3000/users";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleBlockStatus = async (user) => {
    const newStatus = !user.isBlocked;

    try {
      const res = await fetch(`${API_URL}/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(
        `User ${newStatus ? "blocked ❌" : "unblocked ✅"} successfully`
      );

      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update block status");
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Users</h1>
      <p className="text-gray-600 text-sm mb-4">
        Total: {users.length} user{users.length !== 1 ? "s" : ""}
      </p>

      {users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white shadow rounded-lg p-4 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  {user.fullName || user.username || "User"}

                  {user.isBlocked && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                      Blocked
                    </span>
                  )}
                </span>

                <span className="text-sm text-gray-600">{user.email}</span>

                <span className="text-sm text-gray-700 mt-1">
                  Orders:{" "}
                  <span className="font-semibold">{user.orders?.length || 0}</span>
                </span>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-3">

                <Link
                  to={`/admin/users/${user.id}`}
                  className="px-4 py-2 rounded-md bg-[#B37869] text-white text-sm hover:bg-[#a06757]"
                >
                  View Details
                </Link>

                <button
                  onClick={() => toggleBlockStatus(user)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                    user.isBlocked
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
