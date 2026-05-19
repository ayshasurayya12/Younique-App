import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProductGrid from '../Components/ProductGrid';
import { useWishlist } from '../context/WishlistContext';

const Wishlist = () => {
    const { wishlist } = useWishlist();
    const products = wishlist.map(item => item.product).filter(Boolean);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Heart size={32} className="text-[#B37869]" fill="#B37869" />
                    <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                </div>

                {products.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-lg mx-auto border border-gray-100 mt-10">
                        <div className="w-16 h-16 bg-[#B37869]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart size={30} className="text-[#B37869]" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8">
                            Add items that you like to your wishlist so you can easily find and purchase them later.
                        </p>
                        <Link
                            to="/allproducts"
                            className="px-6 py-3 bg-[#B37869] text-white rounded-xl hover:bg-[#a06757] transition font-semibold shadow-md inline-block"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <ProductGrid 
                        products={products} 
                    />
                )}
            </div>
        </div>
    );
};

export default Wishlist;
