import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaChartBar, FaUsers, FaShoppingCart, FaBox, FaComments, FaQuestionCircle, FaTrendingUp, FaEye, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import { fetchReviewStats, fetchAllReviews } from '../../api/adminReviews';
import AdminSidebar from '../../components/AdminSidebar';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        statusDistribution: { pending: 0, approved: 0, rejected: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [recentReviews, setRecentReviews] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            // Load stats
            const statsData = await fetchReviewStats();
            setStats(statsData);

            // Load recent reviews
            const reviewsData = await fetchAllReviews({ page: 1, limit: 5 });
            setRecentReviews(reviewsData.reviews || []);
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error('Error loading dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRatingColor = (rating) => {
        if (rating >= 4.5) return 'text-green-600';
        if (rating >= 3.5) return 'text-yellow-600';
        if (rating >= 2.5) return 'text-orange-600';
        return 'text-red-600';
    };

    const getStatusColor = (status) => {
        const colors = {
            approved: 'text-green-600',
            pending: 'text-yellow-600',
            rejected: 'text-red-600'
        };
        return colors[status] || 'text-gray-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600">{error}</p>
                    <button
                        onClick={loadDashboardData}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <AdminSidebar>
            <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Reviews */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FaComments className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Total Reviews</h3>
                                    <p className="text-sm text-gray-500">All customer reviews</p>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-blue-600">{stats.totalReviews}</div>
                        </div>
                    </div>

                    {/* Average Rating */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <FaStar className="text-yellow-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Average Rating</h3>
                                    <p className="text-sm text-gray-500">Customer satisfaction</p>
                                </div>
                            </div>
                            <div className={`text-3xl font-bold ${getRatingColor(stats.averageRating)}`}>
                                {stats.averageRating.toFixed(1)}
                            </div>
                        </div>
                    </div>

                    {/* Pending Reviews */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <FaQuestionCircle className="text-yellow-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Pending Reviews</h3>
                                    <p className="text-sm text-gray-500">Awaiting approval</p>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-yellow-600">{stats.statusDistribution.pending}</div>
                        </div>
                    </div>

                    {/* Approved Reviews */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <FaStar className="text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Approved Reviews</h3>
                                    <p className="text-sm text-gray-500">Published reviews</p>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-green-600">{stats.statusDistribution.approved}</div>
                        </div>
                    </div>

                    {/* Rejected Reviews */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <FaTrash className="text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Rejected Reviews</h3>
                                    <p className="text-sm text-gray-500">Not published</p>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-red-600">{stats.statusDistribution.rejected}</div>
                        </div>
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Rating Distribution</h2>
                    <div className="space-y-4">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {[...Array(rating)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                    <span className="text-sm font-medium text-gray-700 ml-2">{rating} Stars</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-yellow-400 h-2 rounded-full"
                                            style={{ width: `${(stats.ratingDistribution[rating] / (stats.totalReviews || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-600 ml-2">
                                        {stats.ratingDistribution[rating]} ({Math.round((stats.ratingDistribution[rating] / (stats.totalReviews || 1)) * 100)}%)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Reviews */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Recent Reviews</h2>
                        <Link
                            to="/admin/reviews"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            View All Reviews
                        </Link>
                    </div>

                    {recentReviews.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FaComments className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p>No reviews yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentReviews.map((review) => (
                                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar
                                                            key={i}
                                                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{review.title}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {review.customerName} • {formatDate(review.date)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                                                {review.status || 'pending'}
                                            </span>
                                            <button className="text-blue-600 hover:text-blue-700 text-sm">
                                                <FaEye />
                                            </button>
                                            <button className="text-red-600 hover:text-red-700 text-sm">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link
                        to="/admin/reviews"
                        className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 text-center"
                    >
                        <FaComments className="h-6 w-6 mx-auto mb-2" />
                        <div>Manage Reviews</div>
                    </Link>

                    <Link
                        to="/admin/analytics"
                        className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 text-center"
                    >
                        <FaChartBar className="h-6 w-6 mx-auto mb-2" />
                        <div>Analytics</div>
                    </Link>

                    <Link
                        to="/admin/export/reviews"
                        className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 text-center"
                    >
                        <FaDownload className="h-6 w-6 mx-auto mb-2" />
                        <div>Export Reviews</div>
                    </Link>
                </div>
            </div>
        </AdminSidebar>
    );
};

export default AdminDashboard;
