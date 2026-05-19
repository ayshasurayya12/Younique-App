import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, Home, ShoppingBag, XCircle, AlertCircle } from 'lucide-react';
import client from '../api/client';
import { getImageSrc } from '../utils/imageHelper';

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const userData = localStorage.getItem('user');
                if (!userData) {
                    navigate('/login');
                    return;
                }
                const user = JSON.parse(userData);
                setCurrentUser(user);
                
                const response = await client.get(`orders/${orderId}/`);
                setOrder(response.data);
            } catch (error) {
                console.error('Error fetching order:', error);
                toast.error('Failed to load order details');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        
        fetchOrder();
    }, [orderId, navigate]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B37869] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <Package size={64} className="mx-auto text-gray-400 mb-4" />
                <h1 className="text-3xl font-bold mb-3">Order Not Found</h1>
                <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
                <Link
                    to="/"
                    className="text-lg bg-[#C58B7A] text-white px-6 py-3 rounded-full hover:bg-[#B37869] transition-colors"
                >
                    Return to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                
                <div className="text-center mb-10">
                    {order.status.toLowerCase() === 'failed' ? (
                        <>
                            <div className="flex justify-center mb-4">
                                <div className="bg-red-100 p-4 rounded-full">
                                    <XCircle size={48} className="text-red-600" />
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold text-red-600 mb-3">Payment Failed</h1>
                            <p className="text-gray-600 text-lg">
                                The payment verification for your order was unsuccessful.
                            </p>
                            <p className="text-gray-500 mt-2">
                                Please try placing the order again or choose Cash on Delivery.
                            </p>
                        </>
                    ) : order.status.toLowerCase() === 'payment pending' ? (
                        <>
                            <div className="flex justify-center mb-4">
                                <div className="bg-yellow-100 p-4 rounded-full">
                                    <AlertCircle size={48} className="text-yellow-600" />
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold text-yellow-600 mb-3">Payment Pending</h1>
                            <p className="text-gray-600 text-lg">
                                We are waiting for payment confirmation for your order.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-center mb-4">
                                <div className="bg-green-100 p-4 rounded-full">
                                    <CheckCircle size={48} className="text-green-600" />
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-3">Order Confirmed!</h1>
                            <p className="text-gray-600 text-lg">
                                Thank you for your purchase, {order.shipping_name}!
                            </p>
                            <p className="text-gray-600">
                                A confirmation email has been sent to your registered email address.
                            </p>
                        </>
                    )}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                    <div className="space-y-6">
                        
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Order Details</h2>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order Number:</span>
                                    <span className="font-semibold">{order.order_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order Date:</span>
                                    <span className="font-semibold">
                                        {new Date(order.created_at).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                                        order.status.toLowerCase() === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                        order.status.toLowerCase() === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                        order.status.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                                        order.status.toLowerCase() === 'payment pending' ? 'bg-orange-100 text-orange-800' :
                                        order.status.toLowerCase() === 'failed' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Method:</span>
                                    <span className="font-semibold text-[#B37869]">{order.payment_method || 'Cash on Delivery'}</span>
                                </div>
                            </div>
                        </div>
                        
                        
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <Truck size={24} className="text-[#B37869]" />
                                <h2 className="text-2xl font-bold">Shipping Information</h2>
                            </div>
                            
                            <div className="space-y-2">
                                <p className="font-semibold">{order.shipping_name}</p>
                                <p>📞 {order.shipping_phone}</p>
                                <p className="pt-2">📍 {order.shipping_house_no}, {order.shipping_street}</p>
                                <p className="pl-6">{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
                            </div>
                        </div>
                    </div>
                    
                
                    <div className="space-y-6">
                    
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Order Items</h2>
                            
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 border-b pb-4 last:border-0">
                                        <img 
                                            src={getImageSrc(item.image)} 
                                            alt={item.title}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="text-sm text-gray-600">
                                                Quantity: {item.quantity} × ₹{parseFloat(item.price).toFixed(2)}
                                            </p>
                                        </div>
                                        <p className="font-bold">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Order Summary</h2>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>₹{order.subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping:</span>
                                    <span>₹{order.shipping_cost}</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total:</span>
                                        <span>₹{order.total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                
                        <div className="flex flex-col gap-3">
                            <Link
                                to="/allproducts"
                                className="w-full bg-[#B37869] text-white py-3 rounded-full text-lg font-semibold hover:bg-[#C58B7A] transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={20} />
                                Continue Shopping
                            </Link>
                            
                            <Link
                                to="/"
                                className="w-full border border-[#B37869] text-[#B37869] py-3 rounded-full text-lg font-semibold hover:bg-[#F2E8E6] transition-colors flex items-center justify-center gap-2"
                            >
                                <Home size={20} />
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
                
            
                <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                        <Truck size={24} />
                        Estimated Delivery
                    </h3>
                    <p className="text-gray-700">
                        Your order will be delivered within <span className="font-semibold">3-5 business days</span>. 
                        You will receive tracking information via email once your order ships.
                    </p>
                    {order.payment_method === 'Cash on Delivery' ? (
                        <p className="text-gray-700 mt-2 font-semibold">
                            💰 Please keep <span className="text-[#B37869]">₹{order.total}</span> in cash ready for delivery.
                        </p>
                    ) : (
                        <p className="text-gray-700 mt-2 font-semibold text-green-700">
                            ✓ Payment received online via Razorpay. No cash needed at delivery.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;