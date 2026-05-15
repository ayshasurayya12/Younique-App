import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, ShoppingBag, Calendar, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = localStorage.getItem('user');

      if (!userData) {
        toast.error('Please login to view profile');
        navigate('/login');
        return;
      }

      try {
        const userFromStorage = JSON.parse(userData);

        const response = await client.get(`/auth/profile/`);
        const userDataFromServer = response.data;

        setUser({
          id: userDataFromServer.id,
          name: userDataFromServer.first_name || userFromStorage.name || 'User',
          email: userDataFromServer.email || userFromStorage.email || 'No email',
          phone: userDataFromServer.phone || 'No phone number',
          username: userDataFromServer.username || userFromStorage.username || '',
          joinedDate: userDataFromServer.date_joined
            ? new Date(userDataFromServer.date_joined).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'Recently'
        });

        // get orders count and recent orders from backend
        const ordersRes = await client.get('/orders/list/');
        const allOrders = ordersRes.data || [];
        setTotalOrdersCount(allOrders.length);

        if (allOrders.length > 0) {
          setRecentOrders(allOrders.slice(0, 2));
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B37869] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-red-600 mb-3">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load your profile information.</p>
          <Link
            to="/login"
            className="text-lg bg-[#C58B7A] text-white px-6 py-3 rounded-full hover:bg-[#B37869] transition-colors"
          >
            Login Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">My Profile</h1>
      <p className="text-gray-600 mb-8">Manage your account and view your information</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <User size={40} className="text-[#B37869]" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>

                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={16} className="text-gray-400" />
                  <p className="text-gray-600 text-sm">Member since {user.joinedDate}</p>
                </div>

                {user.username && (
                  <p className="text-gray-500 text-sm mt-1">@{user.username}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail size={20} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone size={20} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin size={20} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-medium text-sm">{user.id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Recent Orders</h3>
                {totalOrdersCount > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Showing 2 of {totalOrdersCount} order{totalOrdersCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {totalOrdersCount > 0 && (
                <Link
                  to="/orders"
                  className="text-sm text-[#B37869] hover:text-[#C58B7A] font-medium"
                >
                  View All Orders
                </Link>
              )}
            </div>

            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <Link
                    key={order.order_number}
                    to={`/order-confirmation/${order.order_number}`}
                    className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ShoppingBag size={20} className="text-[#B37869]" />
                        <div>
                          <p className="font-medium">Order #{order.order_number}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold mt-2">₹{order.total || '0.00'}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                <h4 className="text-lg font-bold mb-2">No Orders Yet</h4>
                <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                <Link
                  to="/allproducts"
                  className="inline-block bg-[#B37869] text-white px-6 py-2 rounded-full hover:bg-[#C58B7A] transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-semibold border border-red-200"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/orders"
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                <ShoppingBag size={20} className="text-[#B37869]" />
                <span className="font-medium">My Orders</span>
              </Link>

              <button
                onClick={() => navigate('/allproducts')}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 text-left"
              >
                <svg
                  className="w-5 h-5 text-[#B37869]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span className="font-medium">Continue Shopping</span>
              </button>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Account Stats</h3>

            <div className="space-y-4">

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-600">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-700">{totalOrdersCount}</p>
                </div>
                <ShoppingBag size={24} className="text-blue-400" />
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-purple-600">Member Since</p>
                  <p className="text-xl font-bold text-purple-700">{user.joinedDate}</p>
                </div>
                <Calendar size={24} className="text-purple-400" />
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
