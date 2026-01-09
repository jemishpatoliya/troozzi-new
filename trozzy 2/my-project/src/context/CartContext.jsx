import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { token } = useAuth();
    const [items, setItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [itemCount, setItemCount] = useState(0);

    // Calculate item count whenever items change
    useEffect(() => {
        const count = items.reduce((total, item) => total + item.quantity, 0);
        setItemCount(count);
    }, [items]);

    // Fetch cart from server
    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/cart');
            setItems(response.data.items || []);
            setTotalAmount(response.data.totalAmount || 0);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            // If unauthorized, clear cart
            if (error.response?.status === 401) {
                setItems([]);
                setTotalAmount(0);
            }
        } finally {
            setLoading(false);
        }
    };

    // Add item to cart
    const addToCart = async (productId, quantity = 1) => {
        try {
            setLoading(true);
            const response = await apiClient.post('/cart/add', { productId, quantity });
            setItems(response.data.items || []);
            setTotalAmount(response.data.totalAmount || 0);
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error('Failed to add to cart:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to add item to cart'
            };
        } finally {
            setLoading(false);
        }
    };

    // Update cart item quantity
    const updateQuantity = async (productId, quantity) => {
        try {
            setLoading(true);
            const response = await apiClient.put('/cart/update', { productId, quantity });
            setItems(response.data.items || []);
            setTotalAmount(response.data.totalAmount || 0);
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error('Failed to update cart:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to update cart'
            };
        } finally {
            setLoading(false);
        }
    };

    // Remove item from cart
    const removeFromCart = async (productId) => {
        try {
            setLoading(true);

            const shouldUseBodyRemove =
                !productId ||
                typeof productId !== 'string' ||
                productId === '[object Object]';

            const response = shouldUseBodyRemove
                ? await apiClient.delete('/cart/remove', { data: { productId } })
                : await apiClient.delete(`/cart/remove/${productId}`);

            setItems(response.data.items || []);
            setTotalAmount(response.data.totalAmount || 0);
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to remove item from cart'
            };
        } finally {
            setLoading(false);
        }
    };

    // Clear cart
    const clearCart = async () => {
        try {
            setLoading(true);
            const response = await apiClient.delete('/cart/clear');
            setItems([]);
            setTotalAmount(0);
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error('Failed to clear cart:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to clear cart'
            };
        } finally {
            setLoading(false);
        }
    };

    // Get item quantity for a specific product
    const getItemQuantity = (productId) => {
        const item = items.find(item => item.product._id === productId);
        return item ? item.quantity : 0;
    };

    // Check if item is in cart
    const isInCart = (productId) => {
        return items.some(item => item.product._id === productId);
    };

    // Fetch cart on component mount if user is authenticated
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCart();
        }
    }, []);

    useEffect(() => {
        setItems([]);
        setTotalAmount(0);

        if (token) {
            fetchCart();
        }
    }, [token]);

    const value = {
        items,
        totalAmount,
        loading,
        itemCount,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity,
        isInCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
