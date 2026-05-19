import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { getImageSrc } from "../../../utils/imageHelper";
import client from "../../../api/client";

const AdminWishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const PAGE_SIZE = 8;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const loadWishlist = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', currentPage);
            if (searchQuery) params.append('search', searchQuery);

            const res = await client.get(`/admin/wishlists/?${params.toString()}`);
            
            setWishlistItems(res.data.results || []);
            setTotalCount(res.data.count || 0);
            setHasNext(!!res.data.next);
            setHasPrevious(!!res.data.previous);
        } catch {
            toast.error("Failed to load wishlist items");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWishlist();
    }, [currentPage]);

    // Delay search request to prevent too many API requests on typing
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setCurrentPage(1);
            loadWishlist();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const deleteWishlistItem = async (id) => {
        if (!window.confirm("Remove this item from the user's wishlist?")) return;
        try {
            await client.delete(`/admin/wishlists/${id}/`);
            toast.success("Wishlist item removed");
            // Reload current page or go back if it becomes empty
            if (wishlistItems.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            } else {
                loadWishlist();
            }
        } catch {
            toast.error("Failed to remove wishlist item");
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Heart size={28} className="text-[#B37869]" fill="#B37869" />
                    <h1 className="text-2xl font-bold text-[#B37869]">Wishlist Management</h1>
                </div>
                <input
                    type="text"
                    placeholder="Search by user or product..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="px-3 py-2 border rounded-lg shadow-sm text-sm w-full md:w-72"
                />
            </div>

            {loading ? (
                <div className="bg-white shadow-md rounded-lg p-8 text-center text-gray-500">
                    <p className="animate-pulse">Loading wishlist items...</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
                        <table className="min-w-[900px] w-full text-sm">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="p-3">User</th>
                                    <th className="p-3">Product Image</th>
                                    <th className="p-3">Product Title</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Stock Status</th>
                                    <th className="p-3">Added Date</th>
                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wishlistItems.map(item => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                                        <td className="p-3">
                                            <p className="font-semibold text-gray-800">{item.user_name}</p>
                                            <p className="text-xs text-gray-500">{item.user_email}</p>
                                        </td>
                                        <td className="p-3">
                                            <img src={getImageSrc(item.product?.image)} alt={item.product?.title}
                                                className="w-14 h-14 object-contain border rounded" />
                                        </td>
                                        <td className="p-3">
                                            <Link to={`/product/${item.product?.id}`} className="font-medium text-[#B37869] hover:underline">
                                                {item.product?.title}
                                            </Link>
                                        </td>
                                        <td className="p-3 font-semibold">₹{item.product?.price}</td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center justify-center gap-1 px-3 py-1 text-xs font-semibold rounded-full min-w-[90px] ${item.product?.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {item.product?.stock > 0 ? `✔ ${item.product?.stock} In Stock` : "✖ Out of Stock"}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-500">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-3">
                                                <Link to={`/admin/products/edit/${item.product?.id}`} className="text-blue-600 hover:underline">Edit Product</Link>
                                                <button onClick={() => deleteWishlistItem(item.id)} className="text-red-600 hover:underline">Remove</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {wishlistItems.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8 text-gray-500">No wishlisted products found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* pagination controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!hasPrevious}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>

                            <div className="flex items-center gap-1">
                                {getPageNumbers().map((page, index) =>
                                    page === '...' ? (
                                        <span key={`dots-${index}`} className="px-3 py-2 text-gray-400 text-sm">...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-9 h-9 rounded-lg font-medium transition text-sm ${
                                                currentPage === page
                                                    ? 'bg-[#B37869] text-white shadow-md'
                                                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!hasNext}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminWishlist;
