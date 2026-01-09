import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { FaArrowLeft, FaLock, FaCreditCard } from 'react-icons/fa';

const CheckoutPage = () => {
    const { items, totalAmount, fetchCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Success

    const [formData, setFormData] = useState({
        // Customer info
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',

        // Address
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',

        // Payment
        paymentMethod: 'upi',
    });

    const [paymentInit, setPaymentInit] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (items.length === 0) {
            navigate('/cart');
            return;
        }
    }, [user, items, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate address
        if (!formData.addressLine1 || !formData.city || !formData.state || !formData.postalCode) {
            setError('Please fill in all required address fields');
            return;
        }

        setStep(2);
    };

    const handlePayment = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await apiClient.post('/payments/create-order', {
                amount: totalAmount,
                currency: 'INR',
                provider: formData.paymentMethod,
            });

            setPaymentInit(response.data);

            await handlePaymentSuccess(response.data);

        } catch (error) {
            console.error('Payment initiation error:', error);
            const message = error.response?.data?.message || error.response?.data?.error || 'Failed to initiate payment. Please try again.';
            setError(message);
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (initResponse) => {
        try {
            const orderData = {
                currency: 'INR',
                subtotal: totalAmount,
                shipping: 0,
                tax: 0,
                total: totalAmount,
                items: items.map(item => ({
                    productId: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    image: item.product.image || item.product.galleryImages?.[0],
                })),
                customer: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: formData.phone,
                },
                address: {
                    line1: formData.addressLine1,
                    line2: formData.addressLine2,
                    city: formData.city,
                    state: formData.state,
                    postalCode: formData.postalCode,
                    country: formData.country,
                },
            };

            await apiClient.post('/payments/verify', {
                paymentId: initResponse.paymentId,
                status: 'completed',
                orderData,
            });

            setStep(3);
            fetchCart(); // Clear cart

        } catch (error) {
            console.error('Payment verification error:', error);
            const message = error.response?.data?.message || error.response?.data?.error || 'Payment verification failed. Please contact support.';
            setError(message);
            setLoading(false);
        }
    };

    if (step === 3) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <FaLock className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
                    <p className="text-gray-600 mb-6">
                        Your order has been successfully placed and will be delivered soon.
                    </p>
                    <div className="space-y-3">
                        <Link
                            to="/"
                            className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                        >
                            Continue Shopping
                        </Link>
                        <Link
                            to="/orders"
                            className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
                        >
                            View Orders
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <Link
                        to="/cart"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Cart
                    </Link>
                    <h1 className="ml-4 text-3xl font-bold text-gray-900">Checkout</h1>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                                1
                            </div>
                            <span className="ml-2">Address</span>
                        </div>
                        <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                        <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                                2
                            </div>
                            <span className="ml-2">Payment</span>
                        </div>
                        <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                        <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                                3
                            </div>
                            <span className="ml-2">Success</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {step === 1 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                                <form onSubmit={handleAddressSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                                        <input
                                            type="text"
                                            name="addressLine1"
                                            value={formData.addressLine1}
                                            onChange={handleChange}
                                            required
                                            placeholder="Street address"
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                                        <input
                                            type="text"
                                            name="addressLine2"
                                            value={formData.addressLine2}
                                            onChange={handleChange}
                                            placeholder="Apartment, suite, etc. (optional)"
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">State</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={formData.postalCode}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Country</label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700"
                                    >
                                        Continue to Payment
                                    </button>
                                </form>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

                                <div className="mb-6">
                                    <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="upi"
                                            checked={formData.paymentMethod === 'upi'}
                                            onChange={handleChange}
                                            className="mr-3"
                                        />
                                        <FaCreditCard className="mr-2 text-indigo-600" />
                                        <div>
                                            <div className="font-medium">UPI</div>
                                            <div className="text-sm text-gray-500">Pay with UPI (mocked)</div>
                                        </div>
                                    </label>
                                </div>

                                <div className="mb-6">
                                    <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="phonepe"
                                            checked={formData.paymentMethod === 'phonepe'}
                                            onChange={handleChange}
                                            className="mr-3"
                                        />
                                        <FaCreditCard className="mr-2 text-indigo-600" />
                                        <div>
                                            <div className="font-medium">PhonePe</div>
                                            <div className="text-sm text-gray-500">Pay with PhonePe (mocked)</div>
                                        </div>
                                    </label>
                                </div>

                                <div className="mb-6">
                                    <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="paytm"
                                            checked={formData.paymentMethod === 'paytm'}
                                            onChange={handleChange}
                                            className="mr-3"
                                        />
                                        <FaCreditCard className="mr-2 text-indigo-600" />
                                        <div>
                                            <div className="font-medium">Paytm</div>
                                            <div className="text-sm text-gray-500">Pay with Paytm (mocked)</div>
                                        </div>
                                    </label>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-md mb-6">
                                    <h3 className="font-medium mb-2">Order Summary</h3>
                                    <div className="space-y-2 text-sm">
                                        {items.map((item) => (
                                            <div key={item.product._id} className="flex justify-between">
                                                <span>{item.product.name} x {item.quantity}</span>
                                                <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between font-semibold">
                                                <span>Total</span>
                                                <span>₹{totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)}`}
                                </button>

                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full mt-3 border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50"
                                >
                                    Back to Address
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.product._id} className="flex items-center space-x-4">
                                        <img
                                            src={item.product.image || item.product.galleryImages?.[0] || ''}
                                            alt={item.product.name}
                                            className="w-16 h-16 object-cover rounded-md"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-medium text-sm">{item.product.name}</h3>
                                            <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                                            <p className="font-semibold">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}

                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>₹{totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Shipping</span>
                                        <span>Free</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Tax</span>
                                        <span>₹0.00</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                                        <span>Total</span>
                                        <span>₹{totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
