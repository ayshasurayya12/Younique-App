import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../api/client';
import { getImageSrc } from '../utils/imageHelper';

const CartPage = ({ refreshCartCount }) => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchUserCart = async () => {
            const userData = localStorage.getItem('user');
            if (!userData) {
                setCurrentUser(null);
                setLoading(false);
                return;
            }

            setCurrentUser(JSON.parse(userData));

            try {
                const res = await client.get('/cart/');
                setCart(res.data);
            } catch {
                toast.error("Failed to load cart");
            } finally {
                setLoading(false);
            }
        };

        fetchUserCart();
    }, []);

    const calculateTotal = () =>
        cart.reduce((total, item) => total + item.product.price * item.quantity, 0).toFixed(2);

    const handleRemoveItem = async (cartItemId) => {
        setUpdating(true);
        try {
            await client.delete(`/cart/${cartItemId}/remove/`);
            setCart(cart.filter(item => item.id !== cartItemId));
            refreshCartCount?.();
            toast.success("Item removed");
        } catch {
            toast.error("Error removing item");
        }
        setUpdating(false);
    };

    const handleQuantityChange = async (cartItemId, newQuantity) => {
        setUpdating(true);
        try {
            if (newQuantity <= 0) {
                await client.delete(`/cart/${cartItemId}/remove/`);
                setCart(cart.filter(item => item.id !== cartItemId));
            } else {
                const res = await client.patch(`/cart/${cartItemId}/`, { quantity: newQuantity });
                setCart(cart.map(item => item.id === cartItemId ? res.data : item));
            }
            refreshCartCount?.();
            toast.success("Cart updated");
        } catch {
            toast.error("Error updating cart");
        }
        setUpdating(false);
    };

    const handleCheckout = () => {
        if (!currentUser) return toast.error("Login required");
        if (cart.length === 0) return toast.error("Cart is empty");
        navigate('/checkout');
    };

    if (loading) return (
        <div className="container mx-auto px-4 py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B37869] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
    );

    if (!currentUser) return (
        <div className="container mx-auto px-4 py-20 text-center">
            <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold mb-3">Login Required</h1>
            <Link to="/login" className="text-lg bg-[#C58B7A] text-white px-6 py-3 rounded-full hover:bg-[#B37869]">Login</Link>
        </div>
    );

    if (cart.length === 0) return (
        <div className="container mx-auto px-4 py-20 text-center">
            <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold mb-3">Your Cart is Empty</h1>
            <Link to="/allproducts" className="text-lg bg-[#C58B7A] text-white px-6 py-3 rounded-full hover:bg-[#B37869]">Browse Products</Link>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">
                Shopping Cart ({cart.length} item{cart.length > 1 ? "s" : ""})
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {cart.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row items-center sm:items-start border p-4 rounded-lg bg-white shadow-sm gap-4">
                            <img src={getImageSrc(item.product.image)} alt={item.product.title} className="w-24 h-24 object-contain border rounded" />

                            <div className="flex-1 w-full">
                                <Link to={`/product/${item.product.id}`} className="text-lg font-semibold hover:text-[#B37869] block">
                                    {item.product.title}
                                </Link>
                                <p className="text-sm text-gray-500">{item.product.category?.name}</p>
                                <p className="text-lg font-bold text-green-700 mt-2">₹{item.product.price} each</p>
                            </div>

                            <div className="flex flex-col items-end min-w-[130px]">
                                <p className="text-xl font-bold">₹{(item.product.price * item.quantity).toFixed(2)}</p>

                                <div className="flex items-center mt-3 border rounded">
                                    <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} disabled={updating}
                                        className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40">
                                        <Minus size={16} />
                                    </button>
                                    <span className="px-4 text-lg font-medium">{item.quantity}</span>
                                    <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} disabled={updating}
                                        className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40">
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <button onClick={() => handleRemoveItem(item.id)} disabled={updating}
                                    className="text-red-500 hover:text-red-700 mt-1 text-sm flex items-center gap-1 disabled:opacity-40">
                                    <X size={14} /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50 p-6 rounded-lg shadow-md h-fit sticky top-20">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">Order Summary</h2>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                            <span>Subtotal ({cart.length} item{cart.length > 1 ? "s" : ""}):</span>
                            <span>₹{calculateTotal()}</span>
                        </div>
                        <div className="border-t pt-3">
                            <div className="flex justify-between mb-2">
                                <span>Shipping:</span>
                                <span className="text-green-600">FREE</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold">
                                <span>Order Total:</span>
                                <span>₹{calculateTotal()}</span>
                            </div>
                        </div>
                    </div>

                    <button onClick={handleCheckout} disabled={updating}
                        className="w-full bg-[#B37869] text-white py-3 mt-6 rounded-full text-lg font-semibold hover:bg-[#C58B7A] disabled:opacity-40">
                        {updating ? "Updating..." : "Proceed to Checkout"}
                    </button>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">👋 Welcome back, {currentUser?.name || currentUser?.username}!</p>
                        <p className="text-xs text-blue-600 mt-1">💰 Pay with cash upon delivery</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;