import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

/**
 * ✅ Extract date from order ID safely
 * Works for:
 *  - ORD-1765521963235-948
 *  - ORD-1765525747950
 *  - Any ID containing a 10+ digit timestamp
 */
const getDateFromOrderId = (orderId) => {
  if (!orderId) return null;

  // find first long number (timestamp in ms)
  const match = orderId.match(/\d{10,}/);
  if (!match) return null;

  const timestamp = Number(match[0]);
  if (isNaN(timestamp)) return null;

  return new Date(timestamp);
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllOrders();
  }, []);

  const loadAllOrders = async () => {
    try {
      const res = await fetch("http://localhost:3000/users");
      if (!res.ok) throw new Error();

      const users = await res.json();
      const allOrders = [];

      users.forEach((user) => {
        (user.orders || []).forEach((order) => {
          allOrders.push({
            ...order,
            userId: user.id,
            userName: user.fullName || user.username || "User",
          });
        });
      });

      // ✅ Sort by extracted timestamp (latest first)
      const sortedOrders = [...allOrders].sort((a, b) => {
        const t1 = getDateFromOrderId(a.id)?.getTime() || 0;
        const t2 = getDateFromOrderId(b.id)?.getTime() || 0;
        return t2 - t1;
      });

      setOrders(sortedOrders);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, userId, newStatus) => {
    try {
      const userRes = await fetch(`http://localhost:3000/users/${userId}`);
      const user = await userRes.json();

      const updatedOrders = user.orders.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      );

      await fetch(`http://localhost:3000/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: updatedOrders }),
      });

      toast.success("Order status updated");
      loadAllOrders();
    } catch {
      toast.error("Failed to update order");
    }
  };

  if (loading) {
    return <div className="p-6">Loading orders...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">All Orders</h1>

      <div className="space-y-4">
        {orders.map((order, index) => {
          const orderDate = getDateFromOrderId(order.id);

          return (
            <div
              key={order.id}
              className="
                p-4 bg-white rounded shadow border
                flex flex-col gap-4
                sm:flex-row sm:justify-between sm:items-center
              "
            >
              <div>
                <p className="font-bold">
                  Order #{order.id}
                  {index === 0 && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Latest
                    </span>
                  )}
                </p>

                <p className="text-sm text-gray-600">
                  Customer: {order.userName}
                </p>

                {/* ✅ Placed on (robust) */}
                {orderDate ? (
                  <p className="text-sm text-gray-500">
                    Placed on: {orderDate.toLocaleString()}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Date not available
                  </p>
                )}

                <p className="text-sm">
                  Status:{" "}
                  <span className="font-semibold">
                    {order.status}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatus(order.id, order.userId, e.target.value)
                  }
                  className="
                    border p-2 rounded bg-zinc-100 text-sm
                    w-full sm:w-auto
                  "
                >
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>

                <Link
                  to={`/admin/orders/${order.id}`}
                  state={{ userId: order.userId }}
                  className="
                    px-4 py-2 rounded bg-[#B37869] text-white
                    hover:bg-[#a06757] text-sm text-center
                  "
                >
                  View
                </Link>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <p className="text-center text-gray-500">
            No orders found.
          </p>
        )}
      </div>
    </div>
  );
}
