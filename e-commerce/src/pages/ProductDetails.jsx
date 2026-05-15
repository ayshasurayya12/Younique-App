import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import client from '../api/client';
import { getImageSrc } from '../utils/imageHelper';

function ProductDetails({ refreshCartCount }) {
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);

    const { id } = useParams();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await client.get(`/products/${id}/`);
                setProduct(res.data);
            } catch {
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        const userData = localStorage.getItem('user');

        if (userData) {
            setCurrentUser(JSON.parse(userData));
        }

        load();
    }, [id]);

    const handleAddToCartClick = async () => {
        if (!currentUser) {
            toast.error("Please login to add items");
            return navigate("/login");
        }

        if (currentUser?.isBlocked) {
            toast.error("Your account is blocked.");
            return;
        }

        if (product.stock <= 0) {
            toast.error("This product is out of stock!");
            return;
        }

        setAddingToCart(true);

        try {
            await client.post('/cart/add/', {
                product_id: product.id,
                quantity: 1
            });

            refreshCartCount?.();

            toast.success("Added to cart!", {
                iconTheme: {
                    primary: "#B37869",
                    secondary: "#FFFAEE"
                }
            });

        } catch (err) {
            toast.error(
                err.response?.data?.error || "Failed to add item"
            );
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = () => {
        if (!currentUser) {
            toast.error("Please login first");
            return navigate("/login");
        }

        if (currentUser?.isBlocked) {
            toast.error("Your account is blocked.");
            return;
        }

        if (product.stock <= 0) {
            toast.error("This product is out of stock!");
            return;
        }

        setBuyingNow(true);

        localStorage.setItem(
            "buyNowProduct",
            JSON.stringify({
                product: {
                    productId: product.id,
                    title: product.title,
                    price: product.price,
                    quantity: 1,
                    image: product.image,
                    category: product.category?.name,
                }
            })
        );

        navigate("/checkout", {
            state: {
                isBuyNow: true
            }
        });
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 text-center">
                Loading...
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">
                    Product Not Found
                </h1>

                <button
                    onClick={() => navigate('/allproducts')}
                    className="mt-4 px-6 py-3 bg-gray-600 text-white rounded-xl"
                >
                    Back to Products
                </button>
            </div>
        );
    }

    const stock = product.stock;
    const isAvailable = stock > 0;

    const stockLabel = () => {
        if (stock <= 0) {
            return (
                <span className="text-red-600 font-bold">
                    Out of Stock
                </span>
            );
        }

        if (stock <= 5) {
            return (
                <span className="text-yellow-600 font-bold">
                    Only {stock} left!
                </span>
            );
        }

        return (
            <span className="text-green-600 font-bold">
                In Stock ({stock})
            </span>
        );
    };

    return (
        <div className="container mx-auto py-4 px-4">

            <div className="grid md:grid-cols-2 gap-8">

                <img src={getImageSrc(product.image)} alt={product.title} className="rounded-lg shadow-lg" />

                <div className="space-y-4">

                    <h1 className="text-4xl font-bold text-[#B37869]">
                        {product.title}
                    </h1>

                    <p className="text-lg">
                        Category:
                        <b> {product.category?.name}</b>
                    </p>

                    <p className="text-3xl font-bold text-green-700">
                        ₹{product.price}
                    </p>

                    <p className="text-gray-700">
                        {product.description}
                    </p>

                    <p className="text-lg font-semibold">
                        Status: {stockLabel()}
                    </p>

                    <div className="flex flex-col gap-4">

                        <button
                            onClick={handleAddToCartClick}
                            disabled={!isAvailable || addingToCart}
                            className={`px-6 py-3 rounded-xl text-white font-semibold
                            ${
                                isAvailable
                                    ? "bg-[#B37869] hover:bg-[#C58B7A]"
                                    : "bg-gray-400 cursor-not-allowed"
                            }`}
                        >
                            {addingToCart
                                ? "Adding..."
                                : isAvailable
                                ? "Add to Cart"
                                : "Out of Stock"}
                        </button>

                        <button
                            onClick={handleBuyNow}
                            disabled={!isAvailable || buyingNow}
                            className={`px-6 py-3 rounded-xl text-white font-semibold
                            ${
                                isAvailable
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-gray-400 cursor-not-allowed"
                            }`}
                        >
                            {buyingNow
                                ? "Processing..."
                                : isAvailable
                                ? "Buy Now"
                                : "Unavailable"}
                        </button>

                        <button
                            onClick={() => navigate('/allproducts')}
                            className="px-6 py-3 border border-[#B37869] text-[#B37869] rounded-xl hover:bg-[#F2E8E6]"
                        >
                            Back to Products
                        </button>

                        {!currentUser && (
                            <p className="text-sm text-amber-600">
                                💡 Login required to purchase
                            </p>
                        )}

                        {currentUser?.isBlocked && (
                            <p className="text-sm text-red-600 font-semibold">
                                🚫 Your account is blocked.
                            </p>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;
