import React, { useEffect, useState, useRef } from 'react';
import { fetchAllProducts } from '../productContents'; 
import ProductGrid from '../Components/ProductGrid';
import { ChevronDown, Grid, List } from 'lucide-react'; 

function AllProducts({ searchQuery }) {
    const [allProducts, setAllProducts] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All Products");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


useEffect(() => {
    const loadProducts = async () => {
        try {
            const data = await fetchAllProducts();
            console.log('Products loaded:', data.length);
            
            if (data.length === 0) {
                console.warn('No products loaded. Check if JSON Server is running.');
            }
            
            setAllProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };
    
    loadProducts();
}, []);

    const categories = [
        "All Products",
        "Cleanser",
        "Sunscreen",
        "Moisturizer",
        "Serum",
    ];

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        setShowDropdown(false);
    };

    const filteredProducts = allProducts.filter((product) => {
        const categoryMatch = activeCategory === "All Products" || product.category === activeCategory;
        const lowerCaseQuery = searchQuery.toLowerCase();
        const titleMatch = product.title.toLowerCase().includes(lowerCaseQuery);
        const descriptionMatch = product.description.toLowerCase().includes(lowerCaseQuery);
        const queryMatch = titleMatch || descriptionMatch;

        return categoryMatch && queryMatch;
    });

    if (loading) {
        return <div className='text-center text-2xl p-10'>Loading Products...</div>;
    }

    return (
        <div className='container mx-auto my-10 px-4'>
            
            <div className='flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4'>
                <div className='relative' ref={dropdownRef}>
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-800 hidden md:block">
                            Filter by Category:
                        </h2>
                        <div className="relative">
                            <button 
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center justify-between gap-3 bg-white border border-gray-300 hover:border-gray-400 text-gray-800 py-2.5 px-4 rounded-md transition-all w-64"
                            >
                                <div className="flex items-center gap-2">
                                    <Grid className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium truncate">{activeCategory}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
                                    <div className="py-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => handleCategoryClick(cat)}
                                                className={`
                                                    w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2
                                                    ${cat === activeCategory 
                                                        ? 'bg-[#F8F1EE] text-[#B37869] font-medium' 
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                    }
                                                `}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${cat === activeCategory ? 'bg-[#B37869]' : 'bg-gray-300'}`} />
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                
                <div className="text-gray-600">
                    <span className="font-medium">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''} found
                </div>
            </div>

            
            
            <ProductGrid products={filteredProducts} />
            
            {filteredProducts.length === 0 && !loading && (
                <div className='text-center text-xl text-zinc-600 mt-10 py-12'>
                    <p className="mb-2">
                        No products found {searchQuery ? `matching "${searchQuery}"` : ""} 
                        {activeCategory !== "All Products" && ` in category "${activeCategory}"`}.
                    </p>
                    <button 
                        onClick={() => handleCategoryClick("All Products")}
                        className="mt-4 px-4 py-2 bg-[#C58B7A] text-white rounded-md hover:bg-[#B37869] transition-colors"
                    >
                        View All Products
                    </button>
                </div>
            )}
        </div>
    );
}

export default AllProducts;