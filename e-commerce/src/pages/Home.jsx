import React, { useState, useEffect } from 'react'; 
import ProductGrid from '../Components/ProductGrid';
import Footer from '../Components/Footer';
import { Link } from 'react-router-dom';
import { fetchAllProducts } from '../productContents'; 
import logo from '../assets/imgs/logo.png';
import heroo from '../assets/imgs/herosection.png';

const Home = () => { 
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        const loadProducts = async () => {
            const data = await fetchAllProducts();
            setAllProducts(data);
            setLoading(false);
        };
        loadProducts();
    }, []);

    
    let featuredProducts = [];
    
    
    const explicitlyFeatured = allProducts.filter(product => product.isFeatured === true);
    
    
    if (explicitlyFeatured.length > 0) {
        featuredProducts = explicitlyFeatured;
    } else {
    
        featuredProducts = allProducts.slice(0, 8); 
    }


    if (loading) {
        return <div className='text-center text-2xl p-10'>Loading Featured Products...</div>;
    }

    return (
        <div>
    
            <div className="w-full min-h-screen bg-white grid grid-cols-1 lg:grid-cols-2 items-center px-6 lg:px-16 gap-10">
                <div className="space-y-4 text-center lg:text-left">
                    <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-[#B37869]">
                        Welcome to 
                    </h1>
                    <h2>
                        <img className='w-50 sm:w-50 object-contain mx-auto lg:mx-0' src={logo} alt="Logo"/> 
                    </h2>
                    <p className="text-gray-600 text-lg lg:text-xl">
                        Glow naturally with our premium skincare range.
                        Hydrate, repair, and renew with our premium skincare collection.
                    </p>
                    <h1 className='text-2xl font-light'><strong>Skincare That Understands You.</strong></h1>
                    <Link to={'/allproducts'} className="mt-4 px-6 py-3 bg-[#B37869] text-white rounded-xl hover:bg-[#C58B7A] transition">
                        Shop Now
                    </Link>
                </div>
                <div className="flex justify-center">
                    <img
                        src={heroo}
                        alt="Hero"
                        className="w-full max-w-[550px] object-contain rounded"
                    />
                </div>
            </div>

        
            <div className='container mx-auto my-10 px-4'> 
                <h2 className='text-3xl font-bold text-center mb-8 text-[#B37869]'>Featured Products</h2>
                
            
                <ProductGrid products={featuredProducts} /> 

            
                {featuredProducts.length === 0 && !loading && (
                    <div className='text-center my-10'>
                        <p className='text-xl text-zinc-600 mb-4'>No featured products available.</p>
                        <Link 
                            to={'/allproducts'} 
                            className="px-6 py-3 bg-[#B37869] text-white rounded-xl hover:bg-[#C58B7A] transition inline-block"
                        >
                            Browse All Products
                        </Link>
                    </div>
                )}

            
                {featuredProducts.length > 0 && (
                    <div className='text-center mt-10'>
                        <Link 
                            to={'/allproducts'} 
                            className="px-6 py-3 bg-transparent border-2 border-[#B37869] text-[#B37869] rounded-xl hover:bg-[#B37869] hover:text-white transition inline-block"
                        >
                            View All Products →
                        </Link>
                    </div>
                )}
            </div>
            
            
            
        </div>
    );
}

export default Home;