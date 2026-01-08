import React, { useContext } from 'react';
import { Drawer, Button, IconButton, Typography, Box, Divider } from '@mui/material';
import { MdDelete, MdClose } from 'react-icons/md';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ open, onClose }) => {
    const { items, totalAmount, removeFromCart, updateQuantity, clearCart, loading } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    const handleViewCart = () => {
        onClose();
        navigate('/cart');
    };

    const calculateSubtotal = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const shipping = items.length > 0 ? 100 : 0;
    const subtotal = calculateSubtotal();
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + shipping + tax;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: 400,
                    maxWidth: '100%',
                },
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div">
                        Shopping Cart ({items.length})
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <MdClose />
                    </IconButton>
                </Box>

                {/* Cart Items */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <Typography>Loading...</Typography>
                        </Box>
                    ) : items.length === 0 ? (
                        <Box sx={{ textAlign: 'center', p: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                                Your cart is empty
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {items.map((item) => (
                                (() => {
                                    const productId = item?.product?._id || item?.product || item?._id;

                                    return (
                                        <Box key={String(productId)} sx={{
                                            display: 'flex',
                                            gap: 2,
                                            p: 2,
                                            border: 1,
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            position: 'relative'
                                        }}>
                                            {/* Product Image */}
                                            <Box sx={{ width: 80, height: 80, overflow: 'hidden', borderRadius: 1 }}>
                                                <img
                                                    src={item.product?.image || item.image || 'https://via.placeholder.com/80x80'}
                                                    alt={item.product?.name || item.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </Box>

                                            {/* Product Details */}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.2 }}>
                                                    {item.product?.name || item.name}
                                                </Typography>

                                                {/* Quantity Controls */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">Qty:</Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => updateQuantity(productId, Math.max(1, item.quantity - 1))}
                                                            sx={{ p: 0.5 }}
                                                        >
                                                            -
                                                        </IconButton>
                                                        <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                                                            {item.quantity}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => updateQuantity(productId, item.quantity + 1)}
                                                            sx={{ p: 0.5 }}
                                                        >
                                                            +
                                                        </IconButton>
                                                    </Box>
                                                </Box>

                                                {/* Price */}
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                    ₹{(item.price || item.product?.price || 0) * item.quantity}
                                                </Typography>
                                            </Box>

                                            {/* Delete Button */}
                                            <IconButton
                                                size="small"
                                                onClick={() => removeFromCart(productId)}
                                                sx={{ position: 'absolute', top: 8, right: 8 }}
                                            >
                                                <MdDelete fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    );
                                })()
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Footer */}
                {items.length > 0 && (
                    <Box sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
                        {/* Price Summary */}
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Items ({items.length})</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{subtotal.toFixed(0)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Shipping</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{shipping}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Tax (18%)</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{tax}</Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total</Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                    ₹{total.toFixed(0)}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={handleViewCart}
                                sx={{ borderColor: 'orange', color: 'orange', '&:hover': { borderColor: 'darkorange', backgroundColor: 'orange.50' } }}
                            >
                                View Cart
                            </Button>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleCheckout}
                                sx={{ backgroundColor: 'green', '&:hover': { backgroundColor: 'darkgreen' } }}
                            >
                                Checkout
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>
        </Drawer>
    );
};

export default CartDrawer;
