import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Zap, ArrowLeft, CheckCircle, AlertCircle, Clock, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../api/client';
import { getImageSrc } from '../utils/imageHelper';
import { useWishlist } from '../context/WishlistContext';

function ProductDetails({ refreshCartCount }) {
    const navigate = useNavigate();
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);
    const [imgZoomed, setImgZoomed] = useState(false);

    const { isInWishlist, toggleWishlist } = useWishlist();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await client.get(`products/${id}/`);
                setProduct(res.data);
            } catch {
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        const userData = localStorage.getItem('user');
        if (userData) setCurrentUser(JSON.parse(userData));

        load();
    }, [id]);

    const handleAddToCartClick = async () => {
        if (!currentUser) {
            toast.error('Please login to add items');
            return navigate('/login');
        }
        if (currentUser?.isBlocked) {
            toast.error('Your account is blocked.');
            return;
        }
        if (product.stock <= 0) {
            toast.error('This product is out of stock!');
            return;
        }

        setAddingToCart(true);
        try {
            await client.post('cart/add/', { product_id: product.id, quantity: 1 });
            refreshCartCount?.();
            toast.success('Added to cart!', {
                iconTheme: { primary: '#B37869', secondary: '#FFFAEE' },
            });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add item');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = () => {
        if (!currentUser) {
            toast.error('Please login first');
            return navigate('/login');
        }
        if (currentUser?.isBlocked) {
            toast.error('Your account is blocked.');
            return;
        }
        if (product.stock <= 0) {
            toast.error('This product is out of stock!');
            return;
        }

        setBuyingNow(true);
        localStorage.setItem(
            'buyNowProduct',
            JSON.stringify({
                product: {
                    productId: product.id,
                    title: product.title,
                    price: product.price,
                    quantity: 1,
                    image: product.image,
                    category: product.category?.name,
                },
            })
        );
        navigate('/checkout', { state: { isBuyNow: true } });
    };

    const inWishlist = product ? isInWishlist(product.id) : false;
    const isAdmin = currentUser?.role === 'admin';

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product.id);
    };

    /* ── Loading State ── */
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#B37869] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Loading product…</p>
                </div>
            </div>
        );
    }

    /* ── Not Found State ── */
    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
                <h1 className="text-2xl font-bold text-red-600">Product Not Found</h1>
                <button
                    onClick={() => navigate('/allproducts')}
                    className="px-6 py-3 bg-[#B37869] text-white rounded-xl hover:bg-[#a06757] transition font-semibold"
                >
                    ← Back to Products
                </button>
            </div>
        );
    }

    const stock = product.stock;
    const isAvailable = stock > 0;

    const StockBadge = () => {
        if (stock <= 0)
            return (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                    <AlertCircle size={14} /> Out of Stock
                </span>
            );
        if (stock <= 5)
            return (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full">
                    <Clock size={14} /> Only {stock} left!
                </span>
            );
        return (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                <CheckCircle size={14} /> In Stock ({stock} available)
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">

                {/* ── Breadcrumb ── */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-[#B37869] transition">Home</Link>
                    <span>/</span>
                    <Link to="/allproducts" className="hover:text-[#B37869] transition">Products</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-medium line-clamp-1">{product.title}</span>
                </nav>

                {/* ── Main Card ── */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">

                        {/* ── Image Panel ── */}
                        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center min-h-[340px] md:min-h-[480px] p-8 cursor-zoom-in"
                            onClick={() => setImgZoomed(true)}>
                            
                            {!isAdmin && (
                                <button
                                    onClick={handleWishlistToggle}
                                    className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg border border-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 group/heart"
                                    title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                                >
                                    <Heart
                                        size={22}
                                        className={`transition-colors duration-300 ${
                                            inWishlist
                                                ? "text-[#B37869] fill-[#B37869]"
                                                : "text-gray-400 group-hover/heart:text-[#B37869]"
                                        }`}
                                    />
                                </button>
                            )}

                            <img
                                src={getImageSrc(product.image)}
                                alt={product.title}
                                className="max-h-80 md:max-h-96 w-full object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105"
                            />
                            <span className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white/70 backdrop-blur-sm px-2 py-1 rounded-md">
                                Click to zoom
                            </span>
                        </div>

                        {/* ── Info Panel ── */}
                        <div className="flex flex-col justify-between p-8 border-l border-gray-100">
                            <div className="space-y-4">

                                {/* Category pill */}
                                {product.category?.name && (
                                    <span className="inline-block text-xs font-semibold text-[#B37869] bg-[#B37869]/10 px-3 py-1 rounded-full uppercase tracking-wide">
                                        {product.category.name}
                                    </span>
                                )}

                                {/* Title */}
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                                    {product.title}
                                </h1>

                                {/* Price */}
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-green-700">₹{product.price}</span>
                                    <span className="text-sm text-gray-400">incl. all taxes</span>
                                </div>

                                {/* Stock */}
                                <StockBadge />

                                {/* Divider */}
                                <hr className="border-gray-100" />

                                {/* Description */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">About this product</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        {product.description || 'No description available.'}
                                    </p>
                                </div>
                            </div>

                            {/* ── Buttons ── */}
                            <div className="mt-6 flex flex-col gap-3">

                                {!currentUser && (
                                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                        💡 You need to <Link to="/login" className="underline font-medium">login</Link> to purchase
                                    </p>
                                )}

                                {currentUser?.isBlocked && (
                                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-semibold">
                                        🚫 Your account has been blocked.
                                    </p>
                                )}

                                <button
                                    onClick={handleAddToCartClick}
                                    disabled={!isAvailable || addingToCart}
                                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold text-base transition-all duration-200 shadow-sm
                                        ${isAvailable
                                            ? 'bg-[#B37869] hover:bg-[#a06757] active:scale-95'
                                            : 'bg-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    <ShoppingCart size={18} />
                                    {addingToCart ? 'Adding to Cart…' : isAvailable ? 'Add to Cart' : 'Out of Stock'}
                                </button>

                                <button
                                    onClick={handleBuyNow}
                                    disabled={!isAvailable || buyingNow}
                                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold text-base transition-all duration-200 shadow-sm
                                        ${isAvailable
                                            ? 'bg-green-600 hover:bg-green-700 active:scale-95'
                                            : 'bg-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    <Zap size={18} />
                                    {buyingNow ? 'Processing…' : isAvailable ? 'Buy Now' : 'Unavailable'}
                                </button>

                                {!isAdmin && (
                                    <button
                                        onClick={handleWishlistToggle}
                                        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-base transition-all duration-200 shadow-sm border-2 active:scale-95
                                            ${inWishlist
                                                ? 'bg-[#B37869]/10 border-[#B37869] text-[#B37869] hover:bg-[#B37869]/20'
                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Heart size={18} className={inWishlist ? "fill-[#B37869]" : ""} />
                                        {inWishlist ? 'Wishlisted' : 'Add to Wishlist'}
                                    </button>
                                )}

                                <button
                                    onClick={() => navigate('/allproducts')}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-[#B37869] text-[#B37869] font-semibold text-sm hover:bg-[#B37869]/5 transition-all duration-200"
                                >
                                    <ArrowLeft size={16} />
                                    Back to Products
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Zoom Lightbox ── */}
            {imgZoomed && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setImgZoomed(false)}
                >
                    <img
                        src={getImageSrc(product.image)}
                        alt={product.title}
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setImgZoomed(false)}
                        className="absolute top-5 right-6 text-white text-3xl font-bold hover:text-gray-300 transition"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProductDetails;
