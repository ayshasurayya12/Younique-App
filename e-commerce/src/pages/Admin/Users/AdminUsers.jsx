import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import client from "../../../api/client";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const PAGE_SIZE = 8;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', currentPage);
            if (searchQuery) params.append('search', searchQuery);

            const res = await client.get(`/auth/admin/users/?${params.toString()}`);
            
            // Django paginated response format
            setUsers(res.data.results || []);
            setTotalCount(res.data.count || 0);
            setHasNext(!!res.data.next);
            setHasPrevious(!!res.data.previous);
        } catch {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [currentPage]);

    // Delay search request to prevent too many API requests on typing
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setCurrentPage(1);
            loadUsers();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const toggleBlock = async (userId, currentStatus) => {
        const action = currentStatus ? "Unblock" : "Block";
        if (!window.confirm(`${action} this user?`)) return;

        try {
            await client.patch(`/auth/admin/users/${userId}/`, {
                is_blocked: !currentStatus
            });
            toast.success(`User ${action.toLowerCase()}ed`);
            // Reload the list
            loadUsers();
        } catch {
            toast.error(`Failed to ${action.toLowerCase()} user`);
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
                <h1 className="text-2xl font-bold text-[#B37869]">Manage Users</h1>
                <input
                    type="text"
                    placeholder="Search by name, email, username..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="px-3 py-2 border rounded-lg shadow-sm text-sm w-full md:w-72"
                />
            </div>

            {loading ? (
                <div className="bg-white shadow-md rounded-lg p-8 text-center text-gray-500">
                    <p className="animate-pulse">Loading users...</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
                        <table className="min-w-[800px] w-full text-sm">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Username</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Role</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Joined</th>
                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                                        <td className="p-3 text-gray-500">#{user.id}</td>
                                        <td className="p-3 font-medium">{user.first_name || '—'}</td>
                                        <td className="p-3">@{user.username}</td>
                                        <td className="p-3">{user.email}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_staff ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {user.is_staff ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {user.is_blocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-500">
                                            {new Date(user.date_joined).toLocaleDateString()}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-3">
                                                <Link
                                                    to={`/admin/users/${user.id}`}
                                                    className="text-blue-600 hover:underline text-sm"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => toggleBlock(user.id, user.is_blocked)}
                                                    className={`text-sm font-medium hover:underline ${user.is_blocked ? 'text-green-600' : 'text-red-600'}`}
                                                >
                                                    {user.is_blocked ? 'Unblock' : 'Block'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="text-center py-6 text-gray-500">No users found.</td>
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

export default AdminUsers;