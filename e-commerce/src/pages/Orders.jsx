import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, CheckCircle, Clock, Truck, XCircle, MapPin, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../api/client';
import { getImageSrc } from '../utils/imageHelper';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const [savedAddresses, setSavedAddresses] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const userData = localStorage.getItem('user');
            if (!userData) {
                toast.error('Please login to view orders');
                navigate('/login');
                return;
            }

            setCurrentUser(JSON.parse(userData));

            try {
                const [ordersRes, addrRes] = await Promise.all([
                    client.get('/orders/list/'),
                    client.get('/auth/addresses/'),
                ]);

                setOrders(ordersRes.data);
                setSavedAddresses(addrRes.data);
            } catch {
                toast.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    const handleCancelOrder = async (orderNumber) => {
        const confirmCancel = window.confirm('Cancel this order?');
        if (!confirmCancel) return;

        setCancellingOrderId(orderNumber);
        try {
            const res = await client.patch(`/orders/${orderNumber}/cancel/`);
            setOrders(orders.map(o => o.order_number === orderNumber ? res.data : o));
            toast.success('Order cancelled');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to cancel');
        } finally {
            setCancellingOrderId(null);
        }
    };

    const handleDeleteOrder = async (orderNumber) => {
        const confirmDelete = window.confirm("Delete this cancelled order?");
        if (!confirmDelete) return;

        try {
            await client.delete(`/orders/${orderNumber}/delete/`);
            setOrders(orders.filter(o => o.order_number !== orderNumber));
            toast.success("Order deleted");
        } catch {
            toast.error("Failed to delete");
        }
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status.toLowerCase() === filterStatus);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'processing': return 'bg-yellow-100 text-yellow-800';
            case 'shipped': return 'bg-blue-100 text-blue-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'processing': return <Clock size={16} />;
            case 'shipped': return <Truck size={16} />;
            case 'delivered': return <CheckCircle size={16} />;
            case 'cancelled': return <XCircle size={16} />;
            default: return <Package size={16} />;
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!currentUser) return null;

    return (
        <div className="container mx-auto px-4 py-8">

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-[#B37869]" /> Saved Addresses
                </h2>

                {savedAddresses.length === 0 && <p className="text-gray-500">No saved addresses yet.</p>}

                <div className="grid md:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => (
                        <div key={addr.id} className="border p-4 rounded-lg bg-gray-50">
                            <p className="font-semibold">{addr.full_name}</p>
                            <p className="text-sm">{addr.house_no}, {addr.street}</p>
                            <p className="text-sm">{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-sm">Phone: {addr.phone}</p>
                            {addr.is_default && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mt-2 inline-block">Default</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <h1 className="text-3xl font-bold mb-6">My Orders</h1>

            <div className="flex flex-wrap gap-2 mb-6">
                {["all", "processing", "shipped", "delivered", "cancelled"].map(status => (
                    <button key={status} onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 text-sm rounded-full ${filterStatus === status ? "bg-[#B37869] text-white" : "bg-gray-200"}`}>
                        {status.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {filteredOrders.map((order) => (
                    <div key={order.order_number} className="bg-white shadow-md rounded-lg overflow-hidden">

                        <div className="p-6 border-b flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold mb-2">Order #{order.order_number}</h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)} {order.status}
                                </span>
                                <p className="text-sm text-gray-600 mt-2">
                                    <Calendar size={14} className="inline" /> {new Date(order.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <p className="text-2xl font-bold text-[#B37869]">₹{order.total}</p>
                        </div>

                        <div className="p-6">
                            <h3 className="font-semibold mb-4">Items</h3>
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 mb-3">
                                    <img src={getImageSrc(item.image)} className="w-16 h-16 rounded" />
                                    <div className="flex-1">
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-sm">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold">₹{item.price * item.quantity}</p>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 pb-4">
                            <h3 className="font-semibold mb-2 flex gap-2 items-center">
                                <MapPin size={16} className="text-[#B37869]" /> Delivered To:
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="font-medium">{order.shipping_name}</p>
                                <p className="text-sm">{order.shipping_house_no}, {order.shipping_street}</p>
                                <p className="text-sm">{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
                                <p className="text-sm">Phone: {order.shipping_phone}</p>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-100 flex justify-between">
                            {order.status.toLowerCase() === "processing" && (
                                <button onClick={() => handleCancelOrder(order.order_number)}
                                    disabled={cancellingOrderId === order.order_number}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg">
                                    <XCircle className="inline" size={16} /> Cancel
                                </button>
                            )}

                            {order.status.toLowerCase() === "cancelled" && (
                                <button onClick={() => handleDeleteOrder(order.order_number)}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg">
                                    Delete
                                </button>
                            )}

                            <Link to={`/order-confirmation/${order.order_number}`}
                                className="px-4 py-2 bg-[#B37869] text-white rounded-lg">
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;