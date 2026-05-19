import React, { useState } from 'react' 
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './Components/Navbar'
import ProductDetails from './pages/ProductDetails'
import CartPage from './pages/CartPage'
import About from './pages/About'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import AllProducts from './pages/AllProducts'
import Home from './pages/Home'
import Profile from './pages/Profile' 
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Orders from './pages/Orders'
import Contact from './pages/Contact'
import Footer from './Components/Footer'
import AdminLayout from './pages/Admin/AdminLayout'
import Dashboard from './pages/Admin/Dashboard'
import AdminProducts from './pages/Admin/Products/AdminProducts'
import AddProducts from './pages/Admin/Products/AddProducts'
import EditProducts from './pages/Admin/Products/EditProducts'
import AdminUsers from './pages/Admin/Users/AdminUsers'
import UserDetails from './pages/Admin/Users/UserDetails'
import AdminRoute from './Routes/AdminRoutes'
import UserRoute from './Routes/UserRoute'
import NotAuthorized from './pages/Admin/NotAuthorized'
import AdminOrders from './pages/Orders/AdminOrders'
import AdminOrderDetails from './pages/Orders/AdminOrderDetails'
import ScrollToTop from './ScrollToTop'
import OTPLogin from './pages/OTPLogin'
import AdminWishlist from './pages/Admin/Wishlist/AdminWishlist'
import Wishlist from './pages/Wishlist'

const AppContent = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([])
  const [, setUser] = useState(null)
  const [cartRefreshTrigger, setCartRefreshTrigger] = useState(0)

  // hide navbar and footer on admin pages
  const isAdminPage = location.pathname.startsWith('/admin');

  const refreshCartCount = () => {
    setCartRefreshTrigger(prev => prev + 1);
  }

  const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    refreshCartCount();
  }

  const handleLogin = (user) => {
    setUser(user);
  }

  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} /> 
      
      {/* hide navbar on admin pages */}
      {!isAdminPage && (
        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cartRefreshTrigger={cartRefreshTrigger} 
        />
      )}
      
      <ScrollToTop/>
      
      <Routes>
        {/* public routes */}
        <Route path='/about' element={<About/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/not-authorized' element={<NotAuthorized/>}/>
        <Route path='/login' element={<Login handleLogin={handleLogin} refreshCartCount={refreshCartCount}/>}/>
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/otp-login' element={<OTPLogin handleLogin={handleLogin}/>}/>
        <Route path='/' element={<Home searchQuery={searchQuery} handleAddToCart={handleAddToCart}/>}/>
        <Route path='/allproducts' element={<AllProducts searchQuery={searchQuery} handleAddToCart={handleAddToCart}/>}/>
        <Route path='/product/:id' element={<ProductDetails handleAddToCart={handleAddToCart} refreshCartCount={refreshCartCount}/>}/>

        {/* user only routes */}
        <Route path='/cart' element={
          <UserRoute>
            <CartPage cart={cart} setCart={setCart} refreshCartCount={refreshCartCount}/>
          </UserRoute>
        }/>
        <Route path='/profile' element={
          <UserRoute>
            <Profile/>
          </UserRoute>
        }/>
        <Route path='/orders' element={
          <UserRoute>
            <Orders/>
          </UserRoute>
        }/>
        <Route path='/checkout' element={
          <UserRoute>
            <Checkout refreshCartCount={refreshCartCount}/>
          </UserRoute>
        }/>
        <Route path='/order-confirmation/:orderId' element={
          <UserRoute>
            <OrderConfirmation/>
          </UserRoute>
        }/>
        <Route path='/wishlist' element={
          <UserRoute>
            <Wishlist/>
          </UserRoute>
        }/>

        {/* admin only routes */}
        <Route path='/admin' element={
          <AdminRoute>
            <AdminLayout/>
          </AdminRoute>
        }>
          <Route index element={<Dashboard/>}/>
          <Route path='products' element={<AdminProducts/>}/>
          <Route path='products/add' element={<AddProducts/>}/>
          <Route path='products/edit/:id' element={<EditProducts/>}/>
          <Route path='users' element={<AdminUsers/>}/>
          <Route path='users/:id' element={<UserDetails/>}/>
          <Route path='orders' element={<AdminOrders/>}/>
          <Route path='orders/:id' element={<AdminOrderDetails/>}/>
          <Route path='wishlists' element={<AdminWishlist/>}/>
        </Route>
      </Routes>

      {/* hide footer on admin pages */}
      {!isAdminPage && <Footer/>}
    </div>
  )
}

const App = () => {
  return <AppContent/>
}

export default App