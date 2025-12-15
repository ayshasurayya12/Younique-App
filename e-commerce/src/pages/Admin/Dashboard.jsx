import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Package, Truck, CheckCircle, XCircle, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const [totalOrders, setTotalOrders] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  const [bestSellers, setBestSellers] = useState([]);

  const COLORS = ["#B37869", "#C58B7A", "#A56755", "#D7B7AE", "#8E5A4F"];

  useEffect(() => {
    fetchCharts();
  }, []);

  const fetchCharts = async () => {
    try {
      const usersRes = await fetch("http://localhost:3000/users");
      const users = await usersRes.json();

      const productsRes = await fetch("http://localhost:3000/products");
      const products = await productsRes.json();

      const revenueMap = {};
      const allOrders = users.flatMap((u) => u.orders || []);

      allOrders.forEach((order) => {
        const date = new Date(order.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        if (!revenueMap[date]) revenueMap[date] = 0;
        revenueMap[date] += Number(order.totals.total);
      });

      const revenueArray = Object.entries(revenueMap).map(([date, total]) => ({
        date,
        total,
      }));

      setRevenueData(revenueArray);

     
      const countMap = {};
      products.forEach((p) => {
        if (!countMap[p.category]) countMap[p.category] = 0;
        countMap[p.category]++;
      });

      const categoryArray = Object.entries(countMap).map(([name, value]) => ({
        name,
        value,
      }));

      setCategoryData(categoryArray);

      setTotalOrders(allOrders.length);
 
      setStatusCounts({
        processing: allOrders.filter((o) => o.status === "Processing").length,
        shipped: allOrders.filter((o) => o.status === "Shipped").length,
        delivered: allOrders.filter((o) => o.status === "Delivered").length,
        cancelled: allOrders.filter((o) => o.status === "Cancelled").length,
      });

      
      const productSales = {};

      allOrders.forEach((order) => {
        order.items.forEach((item) => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              productId: item.productId,
              title: item.title,
              quantity: 0,
            };
          }
          productSales[item.productId].quantity += item.quantity;
        });
      });

      const sortedBestSellers = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setBestSellers(sortedBestSellers);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  return (
    <div>
      
      <h1 className="text-3xl font-bold mb-4 text-[#B37869]">Admin Dashboard</h1>
      <p className="text-gray-700 mb-6">Manage the website.</p>

  
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Link to="/admin/products" className="admin-card">
          Manage Products
        </Link>

        <Link to="/admin/users" className="admin-card">
          Manage Users
        </Link>

        <Link to="/admin/orders" className="admin-card">
          Manage Orders
        </Link>
      </div>

      
      <h2 className="text-2xl font-bold text-[#B37869] mb-4">
        Order Overview
      </h2>

      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-[#B37869]">
          <p className="text-gray-500">Total Orders</p>
          <h2 className="text-3xl font-bold">{totalOrders}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-yellow-500">
          <p className="text-gray-500 flex items-center gap-2">
            <Package size={18} /> Processing
          </p>
          <h2 className="text-2xl font-semibold">{statusCounts.processing}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500">
          <p className="text-gray-500 flex items-center gap-2">
            <Truck size={18} /> Shipped
          </p>
          <h2 className="text-2xl font-semibold">{statusCounts.shipped}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-600">
          <p className="text-gray-500 flex items-center gap-2">
            <CheckCircle size={18} /> Delivered
          </p>
          <h2 className="text-2xl font-semibold">{statusCounts.delivered}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-red-600">
          <p className="text-gray-500 flex items-center gap-2">
            <XCircle size={18} /> Cancelled
          </p>
          <h2 className="text-2xl font-semibold">{statusCounts.cancelled}</h2>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">

    
        <div className="bg-white shadow rounded-xl p-6 border">
          <h2 className="text-xl font-semibold mb-4 text-[#B37869]">
            Revenue (Sales Trend)
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#B37869" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        
        <div className="bg-white shadow rounded-xl p-6 border">
          <h2 className="text-xl font-semibold mb-4 text-[#B37869]">
            Products by Category
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={110} label>
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-12 bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#B37869]">
          <TrendingUp /> Best Selling Products
        </h2>

        {bestSellers.length === 0 ? (
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
              {bestSellers.map((item) => (
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
