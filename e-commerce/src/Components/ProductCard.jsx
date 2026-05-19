import React from "react";
import { Link } from "react-router-dom";
import { getImageSrc } from '../utils/imageHelper';
import { Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";

const ProductCard = ({ product }) => {
    const { isInWishlist, toggleWishlist } = useWishlist();

    const lowStock = product.stock > 0 && product.stock <= 5;
    const outOfStock = product.stock === 0;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role === "admin";

    const inWishlist = isInWishlist(product.id);

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product.id);
    };

    return (
        <div className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">

            {!isAdmin && (
                <button
                    onClick={handleWishlistToggle}
                    className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 group/heart"
                    title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                    <Heart
                        size={18}
                        className={`transition-colors duration-300 ${
                            inWishlist
                                ? "text-[#B37869] fill-[#B37869]"
                                : "text-gray-400 group-hover/heart:text-[#B37869]"
                        }`}
                    />
                </button>
            )}

            {lowStock && (
                <span className="absolute top-3 left-3 z-10 bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-full shadow">
                    Low Stock!
                </span>
            )}

            {outOfStock && (
                <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    Out of Stock
                </span>
            )}

            {/* Clickable image */}
            <Link to={`/product/${product.id}`} className="block overflow-hidden bg-gray-50">
                <img
                    src={getImageSrc(product.image)}
                    alt={product.title}
                    className="w-full h-52 sm:h-56 md:h-60 object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                />
            </Link>

            <div className="p-4">
                <Link to={`/product/${product.id}`}>
                    <h2 className="text-base font-semibold text-gray-800 line-clamp-2 hover:text-[#B37869] transition-colors">
                        {product.title}
                    </h2>
                </Link>

                <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {product.description}
                </p>

                <div className="flex justify-between items-center mt-3">
                    <span className="text-xl font-bold text-green-700">
                        ₹{product.price}
                    </span>

                    <Link
                        to={`/product/${product.id}`}
                        className="text-sm bg-[#B37869] text-white px-3 py-1.5 rounded-lg hover:bg-[#a06757] transition font-medium"
                    >
                        View Details →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;