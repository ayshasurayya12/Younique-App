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

    // Listen for authentication changes
    useEffect(() => {
        const handleStorageChange = () => {
            const stored = localStorage.getItem('user');
            setUser(stored ? JSON.parse(stored) : null);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Refresh user state from localStorage
    const refreshUser = useCallback(() => {
        const stored = localStorage.getItem('user');
        const parsed = stored ? JSON.parse(stored) : null;
        if (JSON.stringify(parsed) !== JSON.stringify(user)) {
            setUser(parsed);
        }
        return parsed;
    }, [user]);

    const fetchWishlist = useCallback(async () => {
        const currentUser = refreshUser();
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
    }, [refreshUser]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const isInWishlist = useCallback((productId) => {
        return wishlist.some(item => item.product && item.product.id === productId);
    }, [wishlist]);

    const toggleWishlist = async (productId) => {
        const currentUser = refreshUser();
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
                // Remove from wishlist
                await client.delete(`wishlist/${productId}/`);
                setWishlist(prev => prev.filter(item => item.product && item.product.id !== productId));
                toast.success('Removed from wishlist');
            } else {
                // Add to wishlist
                const res = await client.post('wishlist/', { product_id: productId });
                setWishlist(prev => [res.data, ...prev]);
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
        <WishlistContext.Provider value={{ wishlist, loading, isInWishlist, toggleWishlist, fetchWishlist }}>
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
