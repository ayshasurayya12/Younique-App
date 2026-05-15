import React, { useState } from 'react' 
import { Routes, Route } from 'react-router-dom'
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
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
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
import NotAuthorized from './pages/Admin/NotAuthorized'
import AdminOrders from './pages/Orders/AdminOrders'
import AdminOrderDetails from './pages/Orders/AdminOrderDetails'
import ScrollToTop from './ScrollToTop'

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([])
  const [, setUser] = useState(null)
  const [cartRefreshTrigger, setCartRefreshTrigger] = useState(0)

  
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

  const handleLogin = (username, password) => {
    if(username && password){
      setUser({ username });
      return true; 
    }
    return false;
  }

  return (
    <div>
      <Toaster 
        position="bottom-right"
        reverseOrder={false}
      /> 
      
      <Navbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartRefreshTrigger={cartRefreshTrigger} 
      />
      <ScrollToTop/>
      
      <Routes>
        <Route path='/about' element={<About/>}/>
        <Route 
          path='/' 
          element={
            <Home 
              searchQuery={searchQuery}
              handleAddToCart={handleAddToCart}
            />
          }
        />
        <Route 
          path='/product/:id' 
          element={
            <ProductDetails 
              handleAddToCart={handleAddToCart}
              refreshCartCount={refreshCartCount} 
            />
          }
        />
        <Route 
          path='/cart' 
          element={
            <CartPage 
              cart={cart} 
              setCart={setCart}
              refreshCartCount={refreshCartCount} 
            />
          }
        />
        <Route 
          path='/login' 
          element={
            <Login 
              handleLogin={handleLogin}
              refreshCartCount={refreshCartCount} 
            />
          }
        />
        <Route path='/signup' element={<SignUp/>}/>
        <Route 
          path='/allproducts' 
          element={
            <AllProducts 
              searchQuery={searchQuery}
              handleAddToCart={handleAddToCart}
            />
          }
        />
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/orders' element={<Orders/>}/>
        <Route 
          path='/checkout' 
          element={
            <Checkout 
              refreshCartCount={refreshCartCount} 
            />
          }
        />
        <Route path='/order-confirmation/:orderId' element={<OrderConfirmation />} />
        <Route path='not-authorized' element={<NotAuthorized/>}/>
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
        </Route>
      </Routes>
      <Footer/>
    </div>
  )
}

export default App
