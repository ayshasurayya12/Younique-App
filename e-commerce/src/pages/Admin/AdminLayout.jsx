import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F2F0]">

      <aside className="
        w-full md:w-64 
        bg-white border-r border-[#E5D5D0] shadow-md 
        p-6 flex flex-col
        md:min-h-screen
      ">
        <h1 className="text-2xl font-bold text-[#B37869] mb-10 tracking-wide text-center md:text-left">
          Admin Panel
        </h1>

        <nav className="flex flex-col gap-4 text-center md:text-left">
          <Link
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isActive("/admin") && !isActive("/admin/products") && !isActive("/admin/users") && !isActive("/admin/orders")
                ? "bg-[#B37869] text-white shadow"
                : "text-gray-700 hover:bg-[#F2E8E6] hover:text-[#B37869]"
            }`}
            to="/admin"
          >
            Dashboard
          </Link>

          <Link
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isActive("/admin/products")
                ? "bg-[#B37869] text-white shadow"
                : "text-gray-700 hover:bg-[#F2E8E6] hover:text-[#B37869]"
            }`}
            to="/admin/products"
          >
            Products
          </Link>

          <Link
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isActive("/admin/users")
                ? "bg-[#B37869] text-white shadow"
                : "text-gray-700 hover:bg-[#F2E8E6] hover:text-[#B37869]"
            }`}
            to="/admin/users"
          >
            Users
          </Link>

          <Link
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isActive("/admin/orders")
                ? "bg-[#B37869] text-white shadow"
                : "text-gray-700 hover:bg-[#F2E8E6] hover:text-[#B37869]"
            }`}
            to="/admin/orders"
          >
            Orders
          </Link>

          <Link
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isActive("/admin/wishlists")
                ? "bg-[#B37869] text-white shadow"
                : "text-gray-700 hover:bg-[#F2E8E6] hover:text-[#B37869]"
            }`}
            to="/admin/wishlists"
          >
            Wishlists
          </Link>
        </nav>

        {/* bottom section */}
        <div className="mt-10 md:mt-auto pt-6 flex flex-col gap-3">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-[#B37869] transition text-center md:text-left"
          >
            ← Back to Home
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center md:justify-start gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition font-medium text-sm border border-red-200"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 w-full p-4 md:p-10 bg-[#F7F2F0]">
        <div className="bg-white rounded-xl shadow p-4 md:p-8 border border-[#E5D5D0]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}