

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Truck } from "lucide-react";
import toast from "react-hot-toast";

const Checkout = ({ refreshCartCount }) => {
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);

    const [isBuyNow, setIsBuyNow] = useState(false);

    const [shippingInfo, setShippingInfo] = useState({
        fullName: "",
        email: "",
        phone: "",
        pincode: "",
    });

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);

    const [showAddAddressModal, setShowAddAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState({
        fullName: "",
        phone: "",
        pincode: "",
    });

    
    useEffect(() => {
        const load = async () => {
            const localUser = localStorage.getItem("user");
            if (!localUser) {
                toast.error("Please log in to continue");
                navigate("/login");
                return;
            }

            const user = JSON.parse(localUser);
            setCurrentUser(user);

            try {
                const res = await fetch(`http://localhost:3000/users/${user.id}`);
                const userFromDB = await res.json();

    
                setSavedAddresses(userFromDB.addresses || []);

                
                setShippingInfo({
                    fullName: userFromDB.fullName || "",
                    email: userFromDB.email || "",
                    phone: userFromDB.phone || "",
                    pincode: userFromDB.pincode || "",
                });

            
                const buyNowData = localStorage.getItem("buyNowProduct");
                if (buyNowData) {
                    setIsBuyNow(true);
                    const p = JSON.parse(buyNowData);

                    setCart([
                        {
                            productId: p.product.productId,
                            title: p.product.title,
                            price: p.product.price,
                            quantity: p.product.quantity,
                            image: p.product.image,
                            category: p.product.category,
                        },
                    ]);
                } else {
                    setCart(userFromDB.cart || []);
                }
            } catch (err) {
                toast.error("Failed to load checkout data");
                navigate("/cart");
            }

            setLoading(false);
        };

        load();
    }, [navigate]);

    
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal;

    
    const verifyStock = async () => {
        for (let item of cart) {
            const res = await fetch(`http://localhost:3000/products/${item.productId}`);
            const product = await res.json();

            if (product.stock < item.quantity) {
                toast.error(`Not enough stock for: ${product.title}`);
                return false;
            }
        }
        return true;
    };

    const updateStock = async () => {
        for (let item of cart) {
            const res = await fetch(`http://localhost:3000/products/${item.productId}`);
            const product = await res.json();

            const newStock = product.stock - item.quantity;

            await fetch(`http://localhost:3000/products/${item.productId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stock: newStock < 0 ? 0 : newStock,
                    inStock: newStock > 0,
                }),
            });
        }
    };

   
    const saveNewAddress = async () => {
        if (!newAddress.fullName || !newAddress.phone || !newAddress.pincode) {
            toast.error("Please fill all address fields");
            return;
        }

        const updatedAddresses = [...savedAddresses, newAddress];

        await fetch(`http://localhost:3000/users/${currentUser.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ addresses: updatedAddresses }),
        });

        setSavedAddresses(updatedAddresses);
        setShowAddAddressModal(false);
        toast.success("New address saved!");
    };

   
    const placeOrder = async () => {
        const valid = shippingInfo.fullName && shippingInfo.email && shippingInfo.phone && shippingInfo.pincode;
        if (!valid) {
            toast.error("Please fill all required fields");
            return;
        }

        const stockOK = await verifyStock();
        if (!stockOK) return;

        setPlacingOrder(true);

        try {
            const orderId = `ORD-${Date.now()}`;

            const userRes = await fetch(`http://localhost:3000/users/${currentUser.id}`);
            const user = await userRes.json();

            const updatedOrders = [
                ...(user.orders || []),
                {
                    id: orderId,
                    date: new Date().toISOString(),
                    status: "Processing",
                    paymentMethod: "Cash on Delivery",
                    items: cart,
                    shippingInfo,
                    totals: {
                        subtotal,
                        shipping: 0,
                        total,
                    },
                },
            ];

            await fetch(`http://localhost:3000/users/${currentUser.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orders: updatedOrders,
                    ...(isBuyNow ? {} : { cart: [] }),
                }),
            });

            await updateStock();

            if (isBuyNow) localStorage.removeItem("buyNowProduct");
            if (refreshCartCount) refreshCartCount();

            toast.success("Order placed!");
            navigate(`/order-confirmation/${orderId}`);
        } catch (err) {
            toast.error("Order failed, try again");
        }

        setPlacingOrder(false);
    };

    const handleBack = () => {
        if (isBuyNow) {
            localStorage.removeItem("buyNowProduct");
            navigate(-1);
        } else {
            navigate("/cart");
        }
    };

    
    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">{isBuyNow ? "Buy Now" : "Checkout"}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            
                <div className="lg:col-span-2 space-y-8">

                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <MapPin size={24} className="text-[#B37869]" />
                            <h2 className="text-2xl font-bold">Shipping Information</h2>
                        </div>

                
                        {savedAddresses.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Choose a saved address:</h3>

                                <div className="space-y-3">
                                    {savedAddresses.map((addr, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-lg border cursor-pointer transition ${
                                                selectedAddressIndex === idx
                                                    ? "border-[#B37869] bg-[#F2E8E6]"
                                                    : "border-gray-300 hover:bg-gray-100"
                                            }`}
                                            onClick={() => {
                                                setSelectedAddressIndex(idx);
                                                setShippingInfo({
                                                    fullName: addr.fullName,
                                                    email: shippingInfo.email,
                                                    phone: addr.phone,
                                                    pincode: addr.pincode,
                                                });
                                            }}
                                        >
                                            <p className="font-medium">{addr.fullName}</p>
                                            <p className="text-sm text-gray-600">Phone: {addr.phone}</p>
                                            <p className="text-sm text-gray-600">Pincode: {addr.pincode}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        
                        <button
                            onClick={() => setShowAddAddressModal(true)}
                            className="mt-3 mb-6 px-4 py-2 bg-[#B37869] text-white rounded-lg hover:bg-[#C58B7A]"
                        >
                            + Add New Address
                        </button>

                    
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {["fullName", "email", "phone", "pincode"].map((field) => (
                                <div key={field}>
                                    <label className="block mb-1 font-medium text-sm">
                                        {field.replace(/([A-Z])/g, " $1")} *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#B37869]"
                                        value={shippingInfo[field]}
                                        onChange={(e) =>
                                            setShippingInfo({ ...shippingInfo, [field]: e.target.value })
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <Truck size={24} className="text-[#B37869]" />
                            <h2 className="text-2xl font-bold">Payment Method</h2>
                        </div>

                        <div className="p-4 bg-[#F2E8E6] border rounded-lg flex items-center gap-3">
                            <Truck size={20} className="text-[#B37869]" />
                            <p>Cash on Delivery</p>
                        </div>
                    </div>
                </div>

                
                <div className="bg-gray-50 p-6 rounded-lg shadow-md sticky top-20">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">Order Summary</h2>

                    {cart.map((item) => (
                        <div key={item.productId} className="flex items-center gap-4 mb-4">
                            <img src={item.image} className="w-12 h-12 rounded" />
                            <div className="flex-1">
                                <p>{item.title}</p>
                                <p className="text-sm text-gray-600">
                                    Qty: {item.quantity} × ₹{item.price}
                                </p>
                            </div>
                            <p className="font-bold">₹{item.price * item.quantity}</p>
                        </div>
                    ))}

                    <div className="mt-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span className="text-green-600">FREE</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold border-t pt-3">
                            <span>Total</span>
                            <span>₹{total}</span>
                        </div>
                    </div>

                    <button
                        onClick={placeOrder}
                        disabled={placingOrder}
                        className="w-full mt-6 bg-[#B37869] text-white py-3 rounded-lg hover:bg-[#C58B7A] font-semibold"
                    >
                        {placingOrder ? "Placing Order..." : "Place Order"}
                    </button>

                    <button
                        onClick={handleBack}
                        className="w-full mt-3 border border-[#B37869] text-[#B37869] py-3 rounded-lg hover:bg-[#F2E8E6]"
                    >
                        {isBuyNow ? "Back to Product" : "Back to Cart"}
                    </button>
                </div>
            </div>

           
            {showAddAddressModal && (
                <div className="fixed inset-0 bg-[#F2E8E6] bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl border border-[#E4D5D0]">
                        <h2 className="text-2xl font-bold mb-4 text-[#B37869]">Add New Address</h2>

                        <div className="space-y-3">
                            {["fullName", "phone", "pincode"].map((field) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium mb-1">
                                        {field.replace(/([A-Z])/g, " $1")}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#B37869]"
                                        onChange={(e) =>
                                            setNewAddress({
                                                ...newAddress,
                                                [field]: e.target.value,
                                            })
                                        }
                                        placeholder={field.replace(/([A-Z])/g, " $1")}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowAddAddressModal(false)}
                                className="px-5 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={saveNewAddress}
                                className="px-5 py-2 rounded-xl bg-[#B37869] text-white hover:bg-[#C58B7A] shadow-md"
                            >
                                Save Address
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
