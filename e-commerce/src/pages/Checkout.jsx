import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Truck } from "lucide-react";
import toast from "react-hot-toast";
import client from '../api/client';
import { getImageSrc } from '../utils/imageHelper';

const Checkout = ({ refreshCartCount }) => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [isBuyNow, setIsBuyNow] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
    const [showAddAddressModal, setShowAddAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState({ full_name: "", phone: "", house_no: "", street: "", city: "", state: "", pincode: "" });
    const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

    const [shippingInfo, setShippingInfo] = useState({
        fullName: "", phone: "", houseNo: "", street: "", city: "", state: "", pincode: "",
    });
    const [addressErrors, setAddressErrors] = useState({
    full_name: "", phone: "", house_no: "",
    street: "", city: "", state: "", pincode: ""
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

            setShippingInfo(prev => ({
                ...prev,
                fullName: user.first_name || user.name || "",
            }));

            try {
                // load saved addresses
                const addrRes = await client.get('auth/addresses/');
                setSavedAddresses(addrRes.data);

                // load cart or buy now
                const buyNowData = localStorage.getItem("buyNowProduct");
                if (buyNowData) {
                    setIsBuyNow(true);
                    const p = JSON.parse(buyNowData);
                    setCart([{
                        id: 'buynow',
                        product: {
                            id: p.product.productId,
                            title: p.product.title,
                            price: p.product.price,
                            image: p.product.image,
                        },
                        quantity: p.product.quantity,
                    }]);
                } else {
                    const cartRes = await client.get('cart/');
                    setCart(cartRes.data);
                }
            } catch {
                toast.error("Failed to load checkout data");
                navigate("/cart");
            }

            setLoading(false);
        };

        load();
    }, [navigate]);

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const saveNewAddress = async () => {
    // validate all fields first
    const fields = ['full_name', 'phone', 'house_no', 'street', 'city', 'state', 'pincode'];
    let hasError = false;

    fields.forEach(field => {
        const error = validateAddressField(field, newAddress[field] || '');
        if (error) hasError = true;
    });

    if (hasError) return;

    try {
        const res = await client.post('auth/addresses/', newAddress);
        setSavedAddresses([...savedAddresses, res.data]);
        setShowAddAddressModal(false);
        setNewAddress({ full_name: "", phone: "", house_no: "", street: "", city: "", state: "", pincode: "" });
        toast.success("Address saved!");
    } catch {
        toast.error("Failed to save address");
    }
};

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const placeOrder = async () => {
        const { fullName, phone, houseNo, street, city, state, pincode } = shippingInfo;
        if (!fullName || !phone || !houseNo || !street || !city || !state || !pincode) {
            toast.error("Please fill all shipping fields");
            return;
        }

        setPlacingOrder(true);

        if (paymentMethod === "Razorpay") {
            const resScript = await loadRazorpayScript();
            if (!resScript) {
                toast.error("Razorpay SDK failed to load. Are you online?");
                setPlacingOrder(false);
                return;
            }
        }

        try {
            const orderData = {
                shipping_name: fullName,
                shipping_phone: phone,
                shipping_house_no: houseNo,
                shipping_street: street,
                shipping_city: city,
                shipping_state: state,
                shipping_pincode: pincode,
                payment_method: paymentMethod,
                is_buy_now: isBuyNow,
                ...(isBuyNow && {
                    buy_now_product_id: cart[0].product.id,
                    buy_now_quantity: cart[0].quantity,
                }),
            };

            const res = await client.post('orders/', orderData);

            if (paymentMethod === "Cash on Delivery") {
                if (isBuyNow) localStorage.removeItem("buyNowProduct");
                refreshCartCount?.();

                toast.success("Order placed!");
                navigate(`/order-confirmation/${res.data.order_number}`);
            } else if (paymentMethod === "Razorpay") {
                const options = {
                    key: res.data.razorpay_key_id,
                    amount: Math.round(res.data.total * 100),
                    currency: "INR",
                    name: "Younique",
                    description: `Payment for order ${res.data.order_number}`,
                    order_id: res.data.razorpay_order_id,
                    handler: async function (response) {
                        try {
                            const verifyRes = await client.post('orders/razorpay/verify/', {
                                order_number: res.data.order_number,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            });

                            if (isBuyNow) localStorage.removeItem("buyNowProduct");
                            refreshCartCount?.();

                            toast.success("Payment successful! Order placed.");
                            navigate(`/order-confirmation/${verifyRes.data.order_number}`);
                        } catch (err) {
                            toast.error(err.response?.data?.error || "Payment verification failed.");
                            setPlacingOrder(false);
                        }
                    },
                    prefill: {
                        name: fullName,
                        contact: phone,
                        email: JSON.parse(localStorage.getItem("user"))?.email || "",
                    },
                    theme: {
                        color: "#B37869",
                    },
                    modal: {
                        ondismiss: function () {
                            toast.error("Payment cancelled");
                            setPlacingOrder(false);
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    toast.error("Payment failed: " + response.error.description);
                    setPlacingOrder(false);
                });
                rzp.open();
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Order failed, try again");
            setPlacingOrder(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    const validateAddressField = (name, value) => {
    let error = "";
    if (name === "phone") {
        if (!value) error = "Phone is required";
        else if (!/^\d{10}$/.test(value)) error = "Must be 10 digits";
    } else if (name === "pincode") {
        if (!value) error = "Pincode is required";
        else if (!/^\d{6}$/.test(value)) error = "Must be 6 digits";
    } else {
        if (!value.trim()) error = `${name.replace("_", " ")} is required`;
    }
    setAddressErrors(prev => ({ ...prev, [name]: error }));
    return error;
};

const handleAddressChange = (field, value) => {
    setNewAddress({ ...newAddress, [field]: value });
    validateAddressField(field, value);
};

const addressInputClass = (field) =>
    `w-full border p-3 rounded-lg outline-none transition focus:ring-2 ${
        addressErrors[field]
            ? "border-red-400 focus:ring-red-300"
            : "border-gray-300 focus:ring-[#B37869]"
    }`;

const AddressFieldError = ({ field }) =>
    addressErrors[field] ? (
        <p className="text-red-500 text-xs mt-1 ml-1">{addressErrors[field]}</p>
    ) : null;

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
                                        <div key={idx}
                                            className={`p-4 rounded-lg border cursor-pointer transition ${selectedAddressIndex === idx ? "border-[#B37869] bg-[#F2E8E6]" : "border-gray-300 hover:bg-gray-100"}`}
                                            onClick={() => {
                                                setSelectedAddressIndex(idx);
                                                setShippingInfo(prev => ({
                                                    ...prev,
                                                    fullName: addr.full_name,
                                                    phone: addr.phone,
                                                    houseNo: addr.house_no,
                                                    street: addr.street,
                                                    city: addr.city,
                                                    state: addr.state,
                                                    pincode: addr.pincode,
                                                }));
                                            }}>
                                            <p className="font-medium">{addr.full_name}</p>
                                            <p className="text-sm text-gray-600">{addr.house_no}, {addr.street}</p>
                                            <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                                            <p className="text-sm text-gray-600">Phone: {addr.phone}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button onClick={() => setShowAddAddressModal(true)}
                            className="mt-3 mb-6 px-4 py-2 bg-[#B37869] text-white rounded-lg hover:bg-[#C58B7A]">
                            + Add New Address
                        </button>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium text-sm text-gray-700">Full Name *</label>
                                    <input type="text"
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#B37869]"
                                        value={shippingInfo.fullName}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                                        placeholder="Full Name" />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium text-sm text-gray-700">Phone Number *</label>
                                    <input type="text"
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#B37869]"
                                        onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                                        value={shippingInfo.phone}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                                        placeholder="Phone Number" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium text-sm text-gray-700">House No/Name *</label>
                                    <input type="text"
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#B37869]"
                                        onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                                        value={shippingInfo.houseNo}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, houseNo: e.target.value })}
                                        placeholder="House No" />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium text-sm text-gray-700">Street *</label>
                                    <input type="text"
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#B37869]"
                                        value={shippingInfo.street}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, street: e.target.value })}
                                        placeholder="Street" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium text-sm text-gray-700">City *</label>
                                    <input type="text"
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#B37869]"
                                        value={shippingInfo.city}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                        placeholder="City" />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium text-sm text-gray-700">State *</label>
                                    <input type="text"
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#B37869]"
                                        value={shippingInfo.state}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                                        placeholder="State" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block mb-1 font-medium text-sm text-gray-700">Pincode *</label>
                                    <input type="text"
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#B37869]"
                                        onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                                        value={shippingInfo.pincode}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, pincode: e.target.value })}
                                        placeholder="Pincode" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <Truck size={24} className="text-[#B37869]" />
                            <h2 className="text-2xl font-bold">Payment Method</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div 
                                onClick={() => setPaymentMethod("Cash on Delivery")}
                                className={`p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition ${paymentMethod === 'Cash on Delivery' ? "border-[#B37869] bg-[#F2E8E6]" : "border-gray-200 hover:bg-gray-50"}`}
                            >
                                <input 
                                    type="radio" 
                                    name="payment_method" 
                                    checked={paymentMethod === 'Cash on Delivery'} 
                                    onChange={() => setPaymentMethod("Cash on Delivery")}
                                    className="accent-[#B37869] h-4 w-4"
                                />
                                <div>
                                    <p className="font-semibold text-gray-800">Cash on Delivery</p>
                                    <p className="text-xs text-gray-500">Pay when order is delivered</p>
                                </div>
                            </div>
                            
                            <div 
                                onClick={() => setPaymentMethod("Razorpay")}
                                className={`p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition ${paymentMethod === 'Razorpay' ? "border-[#B37869] bg-[#F2E8E6]" : "border-gray-200 hover:bg-gray-50"}`}
                            >
                                <input 
                                    type="radio" 
                                    name="payment_method" 
                                    checked={paymentMethod === 'Razorpay'} 
                                    onChange={() => setPaymentMethod("Razorpay")}
                                    className="accent-[#B37869] h-4 w-4"
                                />
                                <div>
                                    <p className="font-semibold text-gray-800">Pay Online (Razorpay)</p>
                                    <p className="text-xs text-gray-500">Pay securely with Cards/UPI/Netbanking</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg shadow-md sticky top-20">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">Order Summary</h2>

                    {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 mb-4">
                            <img src={getImageSrc(item.product.image)} className="w-12 h-12 rounded" />
                            <div className="flex-1">
                                <p>{item.product.title}</p>
                                <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.product.price}</p>
                            </div>
                            <p className="font-bold">₹{item.product.price * item.quantity}</p>
                        </div>
                    ))}

                    <div className="mt-4">
                        <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
                        <div className="flex justify-between"><span>Shipping</span><span className="text-green-600">FREE</span></div>
                        <div className="flex justify-between text-xl font-bold border-t pt-3">
                            <span>Total</span><span>₹{subtotal}</span>
                        </div>
                    </div>

                    <button onClick={placeOrder} disabled={placingOrder}
                        className="w-full mt-6 bg-[#B37869] text-white py-3 rounded-lg hover:bg-[#C58B7A] font-semibold">
                        {placingOrder ? "Placing Order..." : "Place Order"}
                    </button>

                    <button onClick={() => navigate(isBuyNow ? -1 : '/cart')}
                        className="w-full mt-3 border border-[#B37869] text-[#B37869] py-3 rounded-lg hover:bg-[#F2E8E6]">
                        {isBuyNow ? "Back to Product" : "Back to Cart"}
                    </button>
                </div>
            </div>

            {showAddAddressModal && (
    <div className="fixed inset-0 bg-[#F2E8E6] bg-opacity-40 backdrop-blur-sm flex justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl border border-[#E4D5D0] h-fit my-auto">
            <h2 className="text-2xl font-bold mb-4 text-[#B37869]">Add New Address</h2>

            <div className="space-y-3">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
                        <input type="text"
                            className={addressInputClass("full_name")}
                            onChange={(e) => handleAddressChange("full_name", e.target.value)}
                            placeholder="Full Name" />
                        <AddressFieldError field="full_name" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Phone Number</label>
                        <input type="text"
                            className={addressInputClass("phone")}
                            onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                            onChange={(e) => handleAddressChange("phone", e.target.value)}
                            placeholder="10-digit number" />
                        <AddressFieldError field="phone" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">House No</label>
                        <input type="text"
                            className={addressInputClass("house_no")}
                            onChange={(e) => handleAddressChange("house_no", e.target.value)}
                            placeholder="House No" />
                        <AddressFieldError field="house_no" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Street</label>
                        <input type="text"
                            className={addressInputClass("street")}
                            onChange={(e) => handleAddressChange("street", e.target.value)}
                            placeholder="Street" />
                        <AddressFieldError field="street" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">City</label>
                        <input type="text"
                            className={addressInputClass("city")}
                            onChange={(e) => handleAddressChange("city", e.target.value)}
                            placeholder="City" />
                        <AddressFieldError field="city" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">State</label>
                        <input type="text"
                            className={addressInputClass("state")}
                            onChange={(e) => handleAddressChange("state", e.target.value)}
                            placeholder="State" />
                        <AddressFieldError field="state" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Pincode</label>
                    <input type="text"
                        className={addressInputClass("pincode")}
                        onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                        onChange={(e) => handleAddressChange("pincode", e.target.value)}
                        placeholder="6-digit pincode" />
                    <AddressFieldError field="pincode" />
                </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button
                    onClick={() => {
                        setShowAddAddressModal(false);
                        setAddressErrors({
                            full_name: "", phone: "", house_no: "",
                            street: "", city: "", state: "", pincode: ""
                        });
                    }}
                    className="px-5 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100">
                    Cancel
                </button>
                <button onClick={saveNewAddress}
                    className="px-5 py-2 rounded-xl bg-[#B37869] text-white hover:bg-[#C58B7A] shadow-md">
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
