import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
    PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { Package, Truck, CheckCircle, XCircle, TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react";
import client from "../../api/client";

const COLORS = ["#B37869", "#C58B7A", "#A56755", "#D7B7AE", "#8E5A4F"];

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await client.get('/admin/dashboard/');
                setData(res.data);
            } catch (err) {
                console.error('Dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <div className="text-center py-10">Loading dashboard...</div>;
    if (!data) return <div className="text-center py-10 text-red-500">Failed to load dashboard</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4 text-[#B37869]">Admin Dashboard</h1>
            <p className="text-gray-700 mb-6">Welcome back! Here's what's happening.</p>

            {/* quick links */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
                <Link to="/admin/products" className="bg-[#B37869] text-white p-4 rounded-xl text-center font-semibold hover:bg-[#a06757] transition">
                    Manage Products
                </Link>
                <Link to="/admin/users" className="bg-[#B37869] text-white p-4 rounded-xl text-center font-semibold hover:bg-[#a06757] transition">
                    Manage Users
                </Link>
                <Link to="/admin/orders" className="bg-[#B37869] text-white p-4 rounded-xl text-center font-semibold hover:bg-[#a06757] transition">
                    Manage Orders
                </Link>
            </div>

            {/* stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-5 rounded-xl shadow border-l-4 border-[#B37869]">
                    <p className="text-gray-500 flex items-center gap-2"><ShoppingBag size={18}/> Total Orders</p>
                    <h2 className="text-3xl font-bold">{data.total_orders}</h2>
                </div>
                <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-600">
                    <p className="text-gray-500 flex items-center gap-2"><DollarSign size={18}/> Revenue</p>
                    <h2 className="text-3xl font-bold">₹{Number(data.total_revenue).toFixed(0)}</h2>
                </div>
                <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500">
                    <p className="text-gray-500 flex items-center gap-2"><Users size={18}/> Users</p>
                    <h2 className="text-3xl font-bold">{data.total_users}</h2>
                </div>
                <div className="bg-white p-5 rounded-xl shadow border-l-4 border-purple-500">
                    <p className="text-gray-500 flex items-center gap-2"><Package size={18}/> Products</p>
                    <h2 className="text-3xl font-bold">{data.total_products}</h2>
                </div>
            </div>

            {/* order status */}
            <h2 className="text-2xl font-bold text-[#B37869] mb-4">Order Status</h2>
            <div className="grid md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-5 rounded-xl shadow border-l-4 border-yellow-500">
                    <p className="text-gray-500 flex items-center gap-2"><Package size={18}/> Processing</p>
                    <h2 className="text-2xl font-semibold">{data.status_counts.processing}</h2>
                </div>
                <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500">
                    <p className="text-gray-500 flex items-center gap-2"><Truck size={18}/> Shipped</p>
                    <h2 className="text-2xl font-semibold">{data.status_counts.shipped}</h2>
                </div>
                <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-600">
                    <p className="text-gray-500 flex items-center gap-2"><CheckCircle size={18}/> Delivered</p>
                    <h2 className="text-2xl font-semibold">{data.status_counts.delivered}</h2>
                </div>
                <div className="bg-white p-5 rounded-xl shadow border-l-4 border-red-600">
                    <p className="text-gray-500 flex items-center gap-2"><XCircle size={18}/> Cancelled</p>
                    <h2 className="text-2xl font-semibold">{data.status_counts.cancelled}</h2>
                </div>
            </div>

            {/* charts */}
            <div className="grid md:grid-cols-2 gap-10 mb-10">
                <div className="bg-white shadow rounded-xl p-6 border">
                    <h2 className="text-xl font-semibold mb-4 text-[#B37869]">Revenue Trend (Last 30 days)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.revenue_data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="total" stroke="#B37869" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white shadow rounded-xl p-6 border">
                    <h2 className="text-xl font-semibold mb-4 text-[#B37869]">Products by Category</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={data.category_data} dataKey="value" nameKey="name" outerRadius={110} label>
                                {data.category_data.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* best sellers */}
            <div className="bg-white p-6 rounded-xl shadow border">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#B37869]">
                    <TrendingUp /> Best Selling Products
                </h2>
                {data.best_sellers.length === 0 ? (
                    <p className="text-gray-500">No sales yet.</p>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b bg-gray-100 text-left">
                                <th className="p-3">Product</th>
                                <th className="p-3">Quantity Sold</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.best_sellers.map((item) => (
                                <tr key={item.productId} className="border-b">
                                    <td className="p-3 font-medium">{item.title}</td>
                                    <td className="p-3">{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}