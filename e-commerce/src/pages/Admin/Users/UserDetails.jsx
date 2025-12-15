
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = "http://localhost:3000/users";

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  if (loading) return <p>Loading user...</p>;
  if (!user)
    return (
      <div>
        <p className="text-red-600 font-semibold mb-3">User not found.</p>
        <Link
          to="/admin/users"
          className="text-sm text-gray-600 hover:text-[#B37869]"
        >
          ← Back to Users
        </Link>
      </div>
    );

  const orders =
    user.orders && user.orders.length
      ? user.orders
      : [
          {
            id: "HARD-001",
            date: new Date().toISOString(),
            status: "Delivered",
            totals: { total: 799, subtotal: 699, shipping: 100 },
          },
          {
            id: "HARD-002",
            date: new Date().toISOString(),
            status: "Processing",
            totals: { total: 1299, subtotal: 1199, shipping: 100 },
          },
        ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {user.fullName || user.name || user.username || "User"} (ID:{" "}
          <span className="text-sm font-mono">{user.id}</span>)
        </h1>
        <Link
          to="/admin/users"
          className="text-sm text-gray-600 hover:text-[#B37869]"
        >
          ← Back to Users
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-5 space-y-2">
        <h2 className="text-lg font-semibold mb-2">User Details</h2>
        <p>
          <span className="font-medium">Email:</span> {user.email || "N/A"}
        </p>
        <p>
          <span className="font-medium">Phone:</span> {user.phone || "N/A"}
        </p>
        <p>
          <span className="font-medium">Username:</span>{" "}
          {user.username || "N/A"}
        </p>
        <p>
          <span className="font-medium">Joined:</span>{" "}
          {user.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : "Recently"}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-semibold mb-3">Order Details</h2>
        <p className="text-xs text-gray-500 mb-3">
          (If this user has no real orders, these are hard-coded example orders
          for admin panel.)
        </p>

        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm">No orders for this user.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-sm">
                    Order #{order.id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status:{" "}
                    <span className="font-medium">{order.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    Subtotal: ₹{order.totals?.subtotal ?? "--"}
                  </p>
                  <p className="text-sm">
                    Shipping: ₹{order.totals?.shipping ?? "--"}
                  </p>
                  <p className="text-lg font-bold">
                    Total: ₹{order.totals?.total ?? "--"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
