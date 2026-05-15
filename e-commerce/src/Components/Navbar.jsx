import { Search, ShoppingCart, User, Package, Menu, X } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/imgs/logo.png';
import client from '../api/client';

const Navbar = ({ searchQuery, setSearchQuery, cartRefreshTrigger }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const hideNavbar =
        location.pathname === "/login" || location.pathname === "/signup";

    const [isOpen, setIsOpen] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const isProductPage =
        location.pathname === "/allproducts" ||
        location.pathname.startsWith("/product/");

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isLoggedIn = Boolean(user.id || user.username || user.email);

    
    const fetchCartCount = useCallback(async () => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) return setCartCount(0);

        const res = await client.get('/cart/count/');
        setCartCount(res.data.count);
    } catch {
        setCartCount(0);
    }
}, []);

    useEffect(() => {
        if (!isLoggedIn) {
            setCartCount(0);
        }

        fetchCartCount();
    }, [location, cartRefreshTrigger, fetchCartCount, isLoggedIn]);

    
    const handleUserClick = () => {
        if (isLoggedIn) navigate("/profile");
        else setIsOpen(!isOpen);
    };

    if (hideNavbar) return null;

    return (
        <header className="bg-white shadow-md sticky top-0 z-50 w-full">
            <div className="container mx-auto px-4">

        
                <nav className="flex items-center justify-between py-4 w-full">

                
                    <Link to="/" className="flex items-center">
                        <img src={logo} className="w-28 md:w-32" alt="Logo" />
                    </Link>

            
                    <div className="hidden md:flex gap-10 text-lg font-medium">
                        <Link to="/" className="hover:text-[#C58B7A]">Home</Link>
                        <Link to="/about" className="hover:text-[#C58B7A]">About</Link>
                        <Link to="/allproducts" className="hover:text-[#C58B7A]">Products</Link>
                        <Link to="/contact" className="hover:text-[#C58B7A]">Contact</Link>

                        {user.role === "admin" && (
                            <Link to="/admin" className="hover:text-[#C58B7A] font-semibold">
                                Admin
                            </Link>
                        )}
                    </div>

                    
                    <div className="flex items-center gap-5">

                        
                        {isProductPage && (
                            <form className="hidden md:block relative" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-zinc-100 rounded-full border border-zinc-300 py-2 px-4 pl-10 w-72 shadow-sm"
                                />
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                            </form>
                        )}

                
                        <Link to="/cart" className="relative">
                            <ShoppingCart size={28} className="text-gray-700 hover:text-[#C58B7A]" />
                            <span className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        </Link>

                        
                        {isLoggedIn && (
                            <Link to="/orders">
                                <Package size={28} className="text-gray-700 hover:text-[#C58B7A]" />
                            </Link>
                        )}

                    
                        <div className="relative">
                            <User
                                size={32}
                                onClick={handleUserClick}
                                className="cursor-pointer bg-gray-100 p-1.5 rounded-full hover:bg-gray-200"
                            />

                        
                            {!isLoggedIn && isOpen && (
                                <div className="absolute right-0 top-12 bg-white w-40 shadow-lg border rounded-lg p-2">
                                    <Link to="/login" className="block px-3 py-2 hover:bg-gray-100">Login</Link>
                                    <Link to="/signup" className="block px-3 py-2 hover:bg-gray-100">Create Account</Link>
                                </div>
                            )}
                        </div>

                        
                        <button
                            className="md:hidden p-1"
                            onClick={() => setMobileMenu(!mobileMenu)}
                        >
                            {mobileMenu ? <X size={32} /> : <Menu size={32} />}
                        </button>
                    </div>
                </nav>

    
                {isProductPage && (
                    <div className="md:hidden w-full mb-3">
                        <div className="bg-zinc-100 border border-zinc-300 rounded-full flex items-center px-4 py-2 shadow-sm">
                            <Search size={18} className="text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent outline-none ml-2"
                            />
                        </div>
                    </div>
                )}

            
                {mobileMenu && (
                    <div className="md:hidden bg-white shadow-md rounded-lg py-4 flex flex-col gap-4 text-center text-lg">

                        <Link to="/" onClick={() => setMobileMenu(false)}>Home</Link>
                        <Link to="/about" onClick={() => setMobileMenu(false)}>About</Link>
                        <Link to="/allproducts" onClick={() => setMobileMenu(false)}>Products</Link>
                        <Link to="/contact" onClick={() => setMobileMenu(false)}>Contact</Link>

                        {user.role === "admin" && (
                            <Link to="/admin" onClick={() => setMobileMenu(false)}>
                                Admin Panel
                            </Link>
                        )}

                        
                        {isLoggedIn && (
                            <Link to="/orders" onClick={() => setMobileMenu(false)}>
                                My Orders
                            </Link>
                        )}

                        {!isLoggedIn && (
                            <>
                                <Link to="/login" onClick={() => setMobileMenu(false)}>Login</Link>
                                <Link to="/signup" onClick={() => setMobileMenu(false)}>Create Account</Link>
                            </>
                        )}
                    </div>
                )}

            </div>
        </header>
    );
};

export default Navbar;
