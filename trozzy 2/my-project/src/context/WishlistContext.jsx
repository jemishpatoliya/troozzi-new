import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [itemCount, setItemCount] = useState(0);

    // Calculate item count whenever items change
    useEffect(() => {
        setItemCount(items.length);
    }, [items]);

    // Fetch wishlist from server
    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/wishlist');
            setItems(response.data.items || []);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
            // If unauthorized, clear wishlist
            if (error.response?.status === 401) {
                setItems([]);
            }
        } finally {
            setLoading(false);
        }
    };

    // Add item to wishlist
    const addToWishlist = async (productId) => {
        try {
            setLoading(true);
            const response = await apiClient.post('/wishlist/add', { productId });
            setItems(response.data.items || []);
            return true;
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Remove item from wishlist
    const removeFromWishlist = async (productId) => {
        try {
            setLoading(true);
            const response = await apiClient.delete(`/wishlist/remove/${productId}`);
            setItems(response.data.items || []);
            return true;
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Check if item is in wishlist
    const isInWishlist = (productId) => {
        return items.some(item => item.product._id === productId || item.product === productId);
    };

    // Toggle wishlist item
    const toggleWishlist = async (productId) => {
        if (isInWishlist(productId)) {
            return await removeFromWishlist(productId);
        } else {
            return await addToWishlist(productId);
        }
    };

    // Clear wishlist
    const clearWishlist = async () => {
        try {
            setLoading(true);
            await apiClient.delete('/wishlist/clear');
            setItems([]);
            return true;
        } catch (error) {
            console.error('Failed to clear wishlist:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Fetch wishlist on component mount if user is logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchWishlist();
        }
    }, []);

    const value = {
        items,
        itemCount,
        loading,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

export default WishlistProvider;
