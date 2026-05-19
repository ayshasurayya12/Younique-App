import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import client from "../../api/client";
import { getImageSrc } from "../../utils/imageHelper";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const PAGE_SIZE = 8;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', currentPage);
            if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
            if (searchQuery) params.append('search', searchQuery);

            const res = await client.get(`/admin/orders/?${params.toString()}`);
            
            // Django paginated response format
            setOrders(res.data.results || []);
            setTotalCount(res.data.count || 0);
            setHasNext(!!res.data.next);
            setHasPrevious(!!res.data.previous);
        } catch {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [currentPage, statusFilter]);

    // Delay search request to prevent too many API requests on typing
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setCurrentPage(1);
            loadOrders();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const updateStatus = async (orderNumber, newStatus) => {
        try {
            await client.patch(`/admin/orders/${orderNumber}/`, { status: newStatus });
            toast.success("Order status updated");
            // Reload the list
            loadOrders();
        } catch {
            toast.error("Failed to update order");
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'processing': return 'bg-yellow-100 text-yellow-800';
            case 'shipped': return 'bg-blue-100 text-blue-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-[#B37869]">All Orders</h1>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search order, customer..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm w-full sm:w-60"
                    />
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-2 border rounded-lg text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="bg-white shadow-md rounded-xl p-8 text-center text-gray-500">
                    <p className="animate-pulse">Loading orders...</p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {orders.map((order, index) => (
                            <div key={order.order_number}
                                className="p-4 bg-white rounded-xl shadow border flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold">#{order.order_number}</p>
                                        {index === 0 && currentPage === 1 && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Latest</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">Customer: <span className="font-medium">{order.user_name}</span></p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleString()}
                                    </p>
                                    <p className="text-sm font-bold text-[#B37869] mt-1">₹{order.total}</p>
                                    <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-3 items-center">
                                    <select
                                        value={order.status}
                                        onChange={e => updateStatus(order.order_number, e.target.value)}
                                        className="border p-2 rounded-lg bg-zinc-100 text-sm"
                                    >
                                        <option>Processing</option>
                                        <option>Shipped</option>
                                        <option>Delivered</option>
                                        <option>Cancelled</option>
                                    </select>

                                    <Link
                                        to={`/admin/orders/${order.order_number}`}
                                        className="px-4 py-2 rounded-lg bg-[#B37869] text-white hover:bg-[#a06757] text-sm"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {orders.length === 0 && (
                            <p className="text-center text-gray-500 py-10">No orders found.</p>
                        )}
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
}