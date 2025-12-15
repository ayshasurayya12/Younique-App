
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AdminOrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    try {
      const userRes = await fetch(`http://localhost:3000/users/${userId}`);
      const userData = await userRes.json();
      setUser(userData);

      const foundOrder = userData.orders.find(o => o.id === id);
      setOrder(foundOrder);
    } catch {
      toast.error("Order not found");
    }
  };

  const updateStatus = async newStatus => {
    const updatedOrders = user.orders.map(o =>
      o.id === id ? { ...o, status: newStatus } : o
    );

    await fetch(`http://localhost:3000/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders: updatedOrders })
    });

    toast.success("Status updated");
    loadOrder();
  };

  if (!order) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Order #{id}</h1>

      <p className="mt-2">
        <strong>Status:</strong> {order.status}
      </p>

      <select
        className="border p-2 mt-3"
        value={order.status}
        onChange={e => updateStatus(e.target.value)}
      >
        <option>Processing</option>
        <option>Shipped</option>
        <option>Delivered</option>
        <option>Cancelled</option>
      </select>

      <h2 className="text-xl mt-6 font-bold">Items</h2>
      <div className="mt-2 space-y-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="border p-3 rounded">
            <p>{item.title}</p>
            <p>Qty: {item.quantity}</p>
            <p>Price: ₹{item.price}</p>
          </div>
        ))}
      </div>

      <button
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded"
        onClick={async () => {
          if (!window.confirm("Delete this order?")) return;

          const updatedOrders = user.orders.filter(o => o.id !== id);

          await fetch(`http://localhost:3000/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orders: updatedOrders })
          });

          toast.success("Order deleted");
          navigate("/admin/orders");
        }}
      >
        Delete Order
      </button>
    </div>
  );
}
