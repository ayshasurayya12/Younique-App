import React, { useEffect, useState, useRef } from 'react';
import { fetchAllProducts } from '../productContents';
import ProductGrid from '../Components/ProductGrid';
import { ChevronDown, Grid, ChevronLeft, ChevronRight } from 'lucide-react';
import client from '../api/client';

function AllProducts({ searchQuery }) {
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All Products");
    const [showDropdown, setShowDropdown] = useState(false);
    const [categories, setCategories] = useState(["All Products"]);
    const dropdownRef = useRef(null);

    // pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const PAGE_SIZE = 8;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    // close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // load categories once
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await client.get('/categories/');
                const names = res.data.map(c => c.name);
                setCategories(["All Products", ...names]);
            } catch {
                console.error('Failed to load categories');
            }
        };
        loadCategories();
    }, []);

    // load products when page, category, or search changes
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const data = await fetchAllProducts(
                    currentPage,
                    activeCategory,
                    searchQuery
                );
                setAllProducts(data.products);
                setTotalCount(data.count);
                setHasNext(!!data.next);
                setHasPrevious(!!data.previous);
            } catch (error) {
                console.error('Failed to load products:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, [currentPage, activeCategory, searchQuery]);

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        setCurrentPage(1); // reset to page 1 on category change
        setShowDropdown(false);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    if (loading) {
        return (
            <div className='container mx-auto my-10 px-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 my-10'>
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className='container mx-auto my-10 px-4'>

            {/* filter bar */}
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
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2
                                                    ${cat === activeCategory
                                                        ? 'bg-[#F8F1EE] text-[#B37869] font-medium'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
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
                    <span className="font-medium">{totalCount}</span> product{totalCount !== 1 ? 's' : ''} found
                    {totalPages > 1 && (
                        <span className="text-gray-400 ml-2">
                            (Page {currentPage} of {totalPages})
                        </span>
                    )}
                </div>
            </div>

            {/* products grid */}
            {allProducts.length === 0 ? (
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
            ) : (
                <ProductGrid products={allProducts} />
            )}

            {/* pagination controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">

                    {/* previous button */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!hasPrevious}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                        <ChevronLeft size={16} />
                        Previous
                    </button>

                    {/* page numbers */}
                    <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) =>
                            page === '...' ? (
                                <span key={`dots-${index}`} className="px-3 py-2 text-gray-400">...</span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-10 h-10 rounded-lg font-medium transition ${
                                        currentPage === page
                                            ? 'bg-[#B37869] text-white shadow-md'
                                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            )
                        )}
                    </div>

                    {/* next button */}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasNext}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default AllProducts;