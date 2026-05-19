import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Package } from "lucide-react";
import toast from "react-hot-toast";
import { getImageSrc } from "../../utils/imageHelper";
import client from "../../api/client";

export default function AdminOrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await client.get(`/admin/orders/${id}/`);
                setOrder(res.data);
            } catch {
                toast.error("Order not found");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const updateStatus = async (newStatus) => {
        try {
            const res = await client.patch(`/admin/orders/${id}/`, { status: newStatus });
            setOrder(res.data);
            toast.success("Status updated");
        } catch {
            toast.error("Failed to update status");
        }
    };

    const deleteOrder = async () => {
        if (!window.confirm("Delete this order permanently?")) return;
        try {
            await client.delete(`/admin/orders/${id}/`);
            toast.success("Order deleted");
            navigate("/admin/orders");
        } catch {
            toast.error("Failed to delete order");
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'processing': return 'bg-yellow-100 text-yellow-800';
            case 'shipped': return 'bg-blue-100 text-blue-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (!order) return <div className="text-center py-10 text-red-500">Order not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-[#B37869]">Order #{order.order_number}</h1>
                <Link to="/admin/orders" className="text-sm text-gray-600 hover:text-[#B37869]">
                    ← Back to Orders
                </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">

                {/* order info */}
                <div className="bg-white p-6 rounded-xl shadow border-t-4 border-[#B37869]">
                    <h2 className="text-lg font-bold mb-4">Order Info</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Order Number:</span>
                            <span className="font-medium">{order.order_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Date:</span>
                            <span>{new Date(order.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Customer:</span>
                            <span className="font-medium">{order.user_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Email:</span>
                            <span>{order.user_email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Payment:</span>
                            <span>{order.payment_method}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                    </div>

                    {/* update status */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Update Status</label>
                        <select
                            value={order.status}
                            onChange={e => updateStatus(e.target.value)}
                            className="w-full border p-2 rounded-lg bg-zinc-50 text-sm"
                        >
                            <option>Processing</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* shipping info */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-[#B37869]" /> Shipping Info
                    </h2>
                    <div className="space-y-2 text-sm">
                        <p><span className="text-gray-500">Name:</span> <span className="font-medium">{order.shipping_name}</span></p>
                        <p><span className="text-gray-500">Phone:</span> {order.shipping_phone}</p>
                        <p><span className="text-gray-500">Email:</span> {order.shipping_email}</p>
                        <p><span className="text-gray-500">Pincode:</span> {order.shipping_pincode}</p>
                    </div>

                    {/* totals */}
                    <div className="mt-6 pt-4 border-t space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Subtotal:</span>
                            <span>₹{order.subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Shipping:</span>
                            <span className="text-green-600">FREE</span>
                        </div>
                        <div className="flex justify-between text-base font-bold border-t pt-2">
                            <span>Total:</span>
                            <span className="text-[#B37869]">₹{order.total}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* order items */}
            <div className="bg-white p-6 rounded-xl shadow mb-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Package size={18} className="text-[#B37869]" /> Order Items
                </h2>
                <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg">
                            <img
                                src={getImageSrc(item.image)}
                                alt={item.title}
                                className="w-16 h-16 object-contain border rounded"
                            />
                            <div className="flex-1">
                                <p className="font-medium">{item.title}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                <p className="text-sm text-gray-500">₹{item.price} each</p>
                            </div>
                            <p className="font-bold text-[#B37869]">
                                ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* delete button */}
            <button
                onClick={deleteOrder}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
                Delete Order
            </button>
        </div>
    );
}