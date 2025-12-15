import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Package, CheckCircle, Clock, Truck, Home,
    ShoppingBag, Calendar, XCircle, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

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

            try {
                const user = JSON.parse(userData);
                setCurrentUser(user);

                const response = await fetch(`http://localhost:3000/users/${user.id}`);
                if (!response.ok) throw new Error('Failed to fetch user data');

                const userDataFromServer = await response.json();

    
                setSavedAddresses(userDataFromServer.addresses || []);

                
                const userOrders = userDataFromServer.orders || [];
                setOrders(
                    userOrders.sort((a, b) => new Date(b.date) - new Date(a.date))
                );

            } catch (error) {
                console.error('Error fetching orders:', error);
                toast.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);


    
    const handleCancelOrder = async (orderId) => {
        if (!currentUser) return;

        const orderToCancel = orders.find(order => order.id === orderId);
        if (!orderToCancel) return toast.error('Order not found');

        if (orderToCancel.status.toLowerCase() !== 'processing') {
            return toast.error('Only processing orders can be cancelled');
        }

        const confirmCancel = window.confirm('Cancel this order?');
        if (!confirmCancel) return;

        setCancellingOrderId(orderId);

        try {
            const response = await fetch(`http://localhost:3000/users/${currentUser.id}`);
            const userData = await response.json();

            const updatedOrders = userData.orders.map(order =>
                order.id === orderId ? { ...order, status: 'Cancelled' } : order
            );

            await fetch(`http://localhost:3000/users/${currentUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orders: updatedOrders })
            });

            setOrders(updatedOrders);
            toast.success('Order cancelled');
        } catch (error) {
            toast.error('Failed to cancel');
        } finally {
            setCancellingOrderId(null);
        }
    };


    
    const handleDeleteOrder = async (orderId) => {
        if (!currentUser) return;

        const confirmDelete = window.confirm("Delete this cancelled order?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:3000/users/${currentUser.id}`);
            const userData = await response.json();

            const updatedOrders = userData.orders.filter(o => o.id !== orderId);

            await fetch(`http://localhost:3000/users/${currentUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orders: updatedOrders })
            });

            setOrders(updatedOrders);
            toast.success("Order deleted");
        } catch {
            toast.error("Failed to delete");
        }
    };


    
    const filteredOrders =
        filterStatus === 'all'
            ? orders
            : orders.filter(order => order.status.toLowerCase() === filterStatus);


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
                    <MapPin size={20} className="text-[#B37869]" />
                    Saved Addresses
                </h2>

                {savedAddresses.length === 0 && (
                    <p className="text-gray-500">No saved addresses yet.</p>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                    {savedAddresses.map(addr => (
                        <div
                            key={addr.id}
                            className="border p-4 rounded-lg bg-gray-50"
                        >
                            <p className="font-semibold">{addr.fullName}</p>
                            <p className="text-sm">{addr.phone}</p>
                            <p className="text-sm">{addr.email}</p>
                            <p className="text-sm">{addr.pincode}</p>

                            {addr.isDefault && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mt-2 inline-block">
                                    Default Address
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>


            
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>


    
            <div className="flex flex-wrap gap-2 mb-6">
                {["all", "processing", "shipped", "delivered", "cancelled"].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 text-sm rounded-full ${
                            filterStatus === status
                                ? "bg-[#B37869] text-white"
                                : "bg-gray-200"
                        }`}
                    >
                        {status.toUpperCase()}
                    </button>
                ))}
            </div>



            <div className="space-y-6">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                        
                        
                        <div className="p-6 border-b flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold mb-2">Order #{order.id}</h2>

                                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                </span>

                                <p className="text-sm text-gray-600 mt-2">
                                    <Calendar size={14} className="inline" />{" "}
                                    {new Date(order.date).toLocaleDateString()}
                                </p>
                            </div>

                            <p className="text-2xl font-bold text-[#B37869]">
                                ₹{order.totals.total}
                            </p>
                        </div>

    
                        <div className="p-6">
                            <h3 className="font-semibold mb-4">Items</h3>

                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 mb-3">
                                    <img src={item.image} className="w-16 h-16 rounded" />
                                    <div className="flex-1">
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-sm text-gray-600">{item.category}</p>
                                        <p className="text-sm">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold">
                                        ₹{item.price * item.quantity}
                                    </p>
                                </div>
                            ))}
                        </div>

                
                        <div className="px-6 pb-4">
                            <h3 className="font-semibold mb-2 flex gap-2 items-center">
                                <MapPin size={16} className="text-[#B37869]" />  
                                Delivered To:
                            </h3>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="font-medium">{order.shippingInfo.fullName}</p>
                                <p className="text-sm">{order.shippingInfo.phone}</p>
                                <p className="text-sm">{order.shippingInfo.email}</p>
                                <p className="text-sm">{order.shippingInfo.pincode}</p>
                            </div>
                        </div>


    
                        <div className="px-6 py-4 bg-gray-100 flex justify-between">
                            {order.status.toLowerCase() === "processing" && (
                                <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    disabled={cancellingOrderId === order.id}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg"
                                >
                                    <XCircle className="inline" size={16}/> Cancel
                                </button>
                            )}

                            {order.status.toLowerCase() === "cancelled" && (
                                <button
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg"
                                >
                                    Delete
                                </button>
                            )}

                            <Link
                                to={`/order-confirmation/${order.id}`}
                                className="px-4 py-2 bg-[#B37869] text-white rounded-lg"
                            >
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
