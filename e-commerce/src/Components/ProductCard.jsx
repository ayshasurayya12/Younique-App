import React from "react";
import { Link } from "react-router-dom";
import { getImageSrc } from '../utils/imageHelper';



const ProductCard = ({ product }) => {

    const lowStock = product.stock > 0 && product.stock <= 5;
    const outOfStock = product.stock === 0;

    return (
        <div className="relative bg-white rounded-lg shadow hover:shadow-lg transition p-4">

            {lowStock && (
                <span className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-full">
                    Low Stock!
                </span>
            )}

            {outOfStock && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Out of Stock
                </span>
            )}

            <img
                src={getImageSrc(product.image)}
                alt={product.title}
                className="w-full h-48 sm:h-56 md:h-64 object-contain rounded-lg"
            />

            <h2 className="mt-4 text-lg font-semibold text-gray-800">
                {product.title}
            </h2>

            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {product.description}
            </p>

            <div className="flex justify-between items-center mt-3">

                <span className="text-xl font-semibold text-green-700">
                    ₹{product.price}
                </span>

                <Link
                    to={`/product/${product.id}`}
                    className="text-[#B37869] font-medium hover:underline"
                >
                    View Details
                </Link>

            </div>
        </div>
    );
};

export default ProductCard;