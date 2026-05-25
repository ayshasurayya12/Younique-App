import React, { useState, useEffect } from 'react'; 
import ProductGrid from '../Components/ProductGrid';
import { Link } from 'react-router-dom';
import { getImageSrc } from '../utils/imageHelper';
import client from '../api/client';
import logo from '../assets/imgs/logo.png';
import heroo from '../assets/imgs/herosection.png';

const Home = () => { 
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [offerProducts, setOfferProducts] = useState([]);

    useEffect(() => {
    const loadFeatured = async () => {
        try {
            const res = await client.get('/products/featured/');
            setFeaturedProducts(res.data);
        } catch (error) {
            console.error('Failed to load featured products:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadOfferProducts = async () => {
    try {
        const res = await client.get('/offers/');
        const products = [];

        res.data.forEach(offer => {
            if (offer.target === 'product' && offer.product_detail) {
                // attach original price info from offer
                products.push({
                    ...offer.product_detail,
                    offer_discount: offer.discount_value,
                    offer_discount_type: offer.discount_type,
                });
            } else if (offer.target === 'category' && offer.category_detail) {
                // for category offers we still need to fetch products
                // handled below
            }
        });

        // for category-based offers fetch matching products
        const categoryOffers = res.data.filter(o => o.target === 'category' && o.category);
        if (categoryOffers.length > 0) {
            const allRes = await client.get('/products/');
            const all = allRes.data.results || allRes.data;
            const categoryIds = categoryOffers.map(o => o.category);
            all.filter(p => categoryIds.includes(p.category?.id))
               .forEach(p => products.push(p));
        }

        setOfferProducts(products);
    } catch (error) {
        console.error('Failed to load offer products:', error);
    }
};

    loadFeatured();
    loadOfferProducts();
}, []);

    if (loading) {
        return <div className='text-center text-2xl p-10'>Loading...</div>;
    }

    return (
        <div>
            {/* hero section */}
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
                    <Link to='/allproducts' className="mt-4 px-6 py-3 bg-[#B37869] text-white rounded-xl hover:bg-[#C58B7A] transition inline-block">
                        Shop Now
                    </Link>
                </div>
                <div className="flex justify-center">
                    <img src={heroo} alt="Hero" className="w-full max-w-[550px] object-contain rounded" />
                </div>
            </div>

            {/* offer products */}
{offerProducts.length > 0 && (
    <div className='container mx-auto my-10 px-4'>
        <div className='flex items-center justify-center gap-3 mb-8'>
            <span className='text-2xl'>🎉</span>
            <h2 className='text-3xl font-bold text-center text-[#B37869]'>Products On Offer</h2>
            <span className='text-2xl'>🎉</span>
        </div>
        <div className='bg-white border border-[#B37869] rounded-2xl p-6'>
            <ProductGrid products={offerProducts} />
        </div>
        <div className='text-center mt-6'>
            <Link to='/allproducts' className="px-6 py-3 bg-transparent border-2 border-[#B37869] text-[#B37869] rounded-xl hover:bg-[#C58B7A] hover:text-white transition inline-block">
                View All Products →
            </Link>
        </div>
    </div>
)}

            {/* featured products */}
            <div className='container mx-auto my-10 px-4'> 
                <h2 className='text-3xl font-bold text-center mb-8 text-[#B37869]'>Featured Products</h2>
                
                {featuredProducts.length === 0 ? (
                    <div className='text-center my-10'>
                        <p className='text-xl text-zinc-600 mb-4'>No featured products available.</p>
                        <Link to='/allproducts' className="px-6 py-3 bg-[#B37869] text-white rounded-xl hover:bg-[#C58B7A] transition inline-block">
                            Browse All Products
                        </Link>
                    </div>
                ) : (
                    <>
                        <ProductGrid products={featuredProducts} />
                        <div className='text-center mt-10'>
                            <Link to='/allproducts' className="px-6 py-3 bg-transparent border-2 border-[#B37869] text-[#B37869] rounded-xl hover:bg-[#B37869] hover:text-white transition inline-block">
                                View All Products →
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Home;