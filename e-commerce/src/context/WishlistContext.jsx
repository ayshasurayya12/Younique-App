import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    // Poll localStorage every second to detect same-tab login/logout
    useEffect(() => {
        const interval = setInterval(() => {
            const stored = localStorage.getItem('user');
            const parsed = stored ? JSON.parse(stored) : null;
            setUser(prev => {
                // Only update if user actually changed (by ID or null)
                const prevId = prev?.id || null;
                const nextId = parsed?.id || null;
                if (prevId !== nextId) {
                    return parsed;
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Also listen for cross-tab changes
    useEffect(() => {
        const handleStorageChange = () => {
            const stored = localStorage.getItem('user');
            setUser(stored ? JSON.parse(stored) : null);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const fetchWishlist = useCallback(async (currentUser) => {
        if (!currentUser || currentUser.role === 'admin') {
            setWishlist([]);
            return;
        }
        setLoading(true);
        try {
            const res = await client.get('wishlist/');
            setWishlist(res.data || []);
        } catch (err) {
            console.error('Error fetching wishlist:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Whenever user changes, clear wishlist and refetch for the new user
    useEffect(() => {
        setWishlist([]); // always clear first
        fetchWishlist(user);
    }, [user, fetchWishlist]);

    const isInWishlist = useCallback((productId) => {
        return wishlist.some(item => item.product && item.product.id === productId);
    }, [wishlist]);

    const toggleWishlist = async (productId) => {
        const stored = localStorage.getItem('user');
        const currentUser = stored ? JSON.parse(stored) : null;

        if (!currentUser) {
            toast.error('Please login to manage your wishlist');
            return false;
        }

        if (currentUser.role === 'admin') {
            toast.error('Admins cannot have a wishlist');
            return false;
        }

        const isCurrentlyIn = isInWishlist(productId);

        try {
            if (isCurrentlyIn) {
                await client.delete(`wishlist/${productId}/`);
                setWishlist(prev => prev.filter(item => item.product && item.product.id !== productId));
                toast.success('Removed from wishlist');
            } else {
                await client.post('wishlist/', { product_id: productId });
                // Refetch instead of optimistic update to ensure correct state
                await fetchWishlist(currentUser);
                toast.success('Added to wishlist');
            }
            return true;
        } catch (err) {
            console.error('Error toggling wishlist:', err);
            toast.error(err.response?.data?.error || 'Failed to update wishlist');
            return false;
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlist, loading, isInWishlist, toggleWishlist, fetchWishlist: () => fetchWishlist(user) }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};