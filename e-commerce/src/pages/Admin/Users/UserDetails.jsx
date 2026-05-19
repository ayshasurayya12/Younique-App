import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { User, Mail, Phone, Calendar, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import client from "../../../api/client";

const UserDetails = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [userRes, ordersRes] = await Promise.all([
                    client.get(`/auth/admin/users/${id}/`),
                    client.get(`/admin/orders/?search=`),
                ]);
                setUser(userRes.data);

                // filter orders belonging to this user
                const userOrders = ordersRes.data.filter(
                    o => o.user_email === userRes.data.email
                );
                setOrders(userOrders);
            } catch {
                toast.error("Failed to load user details");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const toggleBlock = async () => {
        const action = user.is_blocked ? "Unblock" : "Block";
        if (!window.confirm(`${action} this user?`)) return;

        try {
            const res = await client.patch(`/auth/admin/users/${id}/`, {
                is_blocked: !user.is_blocked
            });
            setUser(res.data);
            toast.success(`User ${action.toLowerCase()}ed`);
        } catch {
            toast.error("Failed to update user");
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
    if (!user) return <div className="text-center py-10 text-red-500">User not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-[#B37869]">User Details</h1>
                <Link to="/admin/users" className="text-sm text-gray-600 hover:text-[#B37869]">
                    ← Back to Users
                </Link>
            </div>

            {/* user info card */}
            <div className="bg-white shadow-md rounded-xl p-6 border-t-4 border-[#B37869] mb-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#F2E8E6] rounded-full flex items-center justify-center">
                            <User size={32} className="text-[#B37869]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user.first_name || user.username}</h2>
                            <p className="text-gray-500">@{user.username}</p>
                            <div className="flex gap-2 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_staff ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {user.is_staff ? 'Admin' : 'User'}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {user.is_blocked ? 'Blocked' : 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={toggleBlock}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${user.is_blocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {user.is_blocked ? 'Unblock User' : 'Block User'}
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail size={18} className="text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-medium">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone size={18} className="text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm font-medium">{user.phone || 'Not provided'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar size={18} className="text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Joined</p>
                            <p className="text-sm font-medium">
                                {new Date(user.date_joined).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* user orders */}
            <div className="bg-white shadow-md rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#B37869]">
                    <ShoppingBag size={20} /> Order History ({orders.length})
                </h3>

                {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">No orders from this user.</p>
                ) : (
                    <div className="space-y-3">
                        {orders.map(order => (
                            <div key={order.order_number}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                <div>
                                    <p className="font-semibold">#{order.order_number}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {order.items?.length} item(s)
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-[#B37869]">₹{order.total}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
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