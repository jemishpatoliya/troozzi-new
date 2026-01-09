import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaHeart, FaRegHeart, FaTruck, FaShieldAlt, FaUndo, FaQuestionCircle, FaUser, FaThumbsUp } from 'react-icons/fa';
import { fetchProductDetails, fetchProductQuestions, askQuestion, answerQuestion, upvoteQuestion, fetchProductReviews, submitProductReview } from '../../api/productDetails';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');

    // Q&A State
    const [questions, setQuestions] = useState([]);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [questionForm, setQuestionForm] = useState({ question: '', customerName: '', customerEmail: '' });
    const [answerForm, setAnswerForm] = useState({ answer: '', sellerName: '' });
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [showAnswerForm, setShowAnswerForm] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);

    // Reviews State
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '', customerName: '', customerEmail: '' });
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState(false);
    const [reviewError, setReviewError] = useState('');

    // Add to cart state
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    useEffect(() => {
        if (productId) {
            loadProductDetails();
            loadQuestions();
            loadReviews();
        }
    }, [productId]);

    const loadProductDetails = async ({ silent = false } = {}) => {
        try {
            if (!silent) setLoading(true);
            const data = await fetchProductDetails(productId);
            setProduct(data);
            if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
            if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
        } catch (err) {
            if (!silent) setError('Failed to load product details');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        if (!productId) return;

        let cancelled = false;
        const refresh = async () => {
            if (cancelled) return;
            await loadProductDetails({ silent: true });
        };

        const onFocus = () => {
            void refresh();
        };
        const onVisibility = () => {
            if (document.visibilityState === 'visible') void refresh();
        };

        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibility);

        const intervalId = window.setInterval(() => {
            void refresh();
        }, 5000);

        return () => {
            cancelled = true;
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibility);
            window.clearInterval(intervalId);
        };
    }, [productId]);

    const loadQuestions = async () => {
        try {
            setQuestionsLoading(true);
            const data = await fetchProductQuestions(productId);
            setQuestions(data.questions || []);
        } catch (err) {
            console.error('Failed to load questions:', err);
        } finally {
            setQuestionsLoading(false);
        }
    };

    const loadReviews = async () => {
        try {
            setReviewsLoading(true);
            const data = await fetchProductReviews(productId);
            setReviews(data.reviews || []);
        } catch (err) {
            console.error('Failed to load reviews:', err);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product || product.stock <= 0) return;

        try {
            setIsAddingToCart(true);
            await addToCart({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity,
                size: selectedSize,
                color: selectedColor,
                sku: product.sku
            });

            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 2000);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleAskQuestion = async (e) => {
        e.preventDefault();
        try {
            const newQuestion = await askQuestion(productId, questionForm);
            setQuestions(prev => [newQuestion, ...prev]);
            setQuestionForm({ question: '', customerName: '', customerEmail: '' });
            setShowQuestionForm(false);
        } catch (error) {
            console.error('Failed to ask question:', error);
        }
    };

    const handleAnswerQuestion = async (e) => {
        e.preventDefault();
        try {
            const newAnswer = await answerQuestion(selectedQuestionId, answerForm);
            setQuestions(prev => prev.map(q =>
                q.id === selectedQuestionId
                    ? { ...q, answers: [...q.answers, newAnswer], isAnswered: true }
                    : q
            ));
            setAnswerForm({ answer: '', sellerName: '' });
            setShowAnswerForm(false);
            setSelectedQuestionId(null);
        } catch (error) {
            console.error('Failed to answer question:', error);
        }
    };

    const handleUpvoteQuestion = async (questionId) => {
        try {
            await upvoteQuestion(questionId);
            setQuestions(prev => prev.map(q =>
                q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
            ));
        } catch (error) {
            console.error('Failed to upvote question:', error);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setIsSubmittingReview(true);
        setReviewError('');
        setReviewSuccess(false);

        try {
            const newReview = await submitProductReview(productId, reviewForm);
            setReviews(prev => [newReview, ...prev]);
            setReviewForm({ rating: 5, title: '', comment: '', customerName: '', customerEmail: '' });
            setShowReviewForm(false);
            setReviewSuccess(true);

            // Update product rating
            if (product) {
                const allRatings = reviews.map(r => r.rating).concat(reviewForm.rating);
                const averageRating = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;
                setProduct(prev => ({ ...prev, rating: Math.round(averageRating * 10) / 10 }));
            }

            // Hide success message after 3 seconds
            setTimeout(() => setReviewSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to submit review:', error);
            setReviewError(error.message || 'Failed to submit review. Please try again.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Product Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Product Images */}
                        <div>
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                                <img
                                    src={product.galleryImages[selectedImage] || product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {(product.galleryImages || [product.image]).map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-blue-600' : 'border-transparent'
                                            }`}
                                    >
                                        <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-lg font-semibold">{(product.rating || 0).toFixed(1)}</span>
                                <span className="text-gray-600">({reviews.length} reviews)</span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                                {product.saleEnabled && (
                                    <>
                                        <span className="text-xl text-gray-400 line-through">{formatPrice(product.price)}</span>
                                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                                            -{product.saleDiscount}%
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 mb-6">{product.description}</p>

                            {/* Product Options */}
                            <div className="space-y-4 mb-6">
                                {/* Size Selection */}
                                {product.sizes?.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                                        <div className="flex gap-2">
                                            {product.sizes.map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`px-4 py-2 rounded-lg border-2 ${selectedSize === size
                                                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Color Selection */}
                                {product.colors?.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                                        <div className="flex gap-2">
                                            {product.colors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`px-4 py-2 rounded-lg border-2 capitalize ${selectedColor === color
                                                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                >
                                                    {color}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                        >
                                            -
                                        </button>
                                        <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stock Status */}
                            <div className="mb-6">
                                {product.stock > 0 ? (
                                    <span className="text-green-600 font-medium">In Stock ({product.stock} available)</span>
                                ) : (
                                    <span className="text-red-600 font-medium">Out of Stock</span>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart || product.stock <= 0}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    {isAddingToCart ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Adding...
                                        </>
                                    ) : justAdded ? (
                                        <>
                                            <FaCheck />
                                            Added to Cart!
                                        </>
                                    ) : (
                                        <>
                                            <FaShoppingCart />
                                            Add to Cart
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => toggleWishlist(product.id)}
                                    className="p-3 rounded-lg border border-gray-300 hover:border-red-500 hover:text-red-500 transition-colors"
                                >
                                    {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
                                </button>
                            </div>

                            {/* Product Features */}
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg">
                                    <FaTruck className="h-6 w-6 text-blue-600" />
                                    <span className="text-sm font-medium">Free Delivery</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg">
                                    <FaShieldAlt className="h-6 w-6 text-blue-600" />
                                    <span className="text-sm font-medium">Secure Payment</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg">
                                    <FaUndo className="h-6 w-6 text-blue-600" />
                                    <span className="text-sm font-medium">Easy Returns</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions & Answers Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FaQuestionCircle />
                            Questions & Answers
                        </h2>
                        <button
                            onClick={() => setShowQuestionForm(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Ask a Question
                        </button>
                    </div>

                    {/* Question Form */}
                    {showQuestionForm && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h3 className="font-semibold mb-4">Ask a Question</h3>
                            <form onSubmit={handleAskQuestion}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        value={questionForm.customerName}
                                        onChange={(e) => setQuestionForm(prev => ({ ...prev, customerName: e.target.value }))}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="Your Email"
                                        value={questionForm.customerEmail}
                                        onChange={(e) => setQuestionForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <textarea
                                    placeholder="Your Question"
                                    value={questionForm.question}
                                    onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                                    rows={3}
                                    required
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        Submit Question
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowQuestionForm(false)}
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Questions List */}
                    <div className="space-y-4">
                        {questions.length === 0 ? (
                            <p className="text-gray-600 text-center py-8">No questions yet. Be the first to ask!</p>
                        ) : (
                            questions.map((question) => (
                                <div key={question.id} className="border-b border-gray-200 pb-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FaUser className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">{question.customerName}</span>
                                                <span className="text-sm text-gray-500">{new Date(question.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-900 mb-2">{question.question}</p>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => handleUpvoteQuestion(question.id)}
                                                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
                                                >
                                                    <FaThumbsUp />
                                                    {question.upvotes}
                                                </button>
                                                {!question.isAnswered && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedQuestionId(question.id);
                                                            setShowAnswerForm(true);
                                                        }}
                                                        className="text-sm text-blue-600 hover:text-blue-700"
                                                    >
                                                        Answer
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Answers */}
                                    {question.answers?.length > 0 && (
                                        <div className="ml-8 mt-4 space-y-2">
                                            {question.answers.map((answer) => (
                                                <div key={answer.id} className="bg-gray-50 p-3 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-sm">{answer.sellerName}</span>
                                                        {answer.isVerified && (
                                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Verified</span>
                                                        )}
                                                        <span className="text-xs text-gray-500">{new Date(answer.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm">{answer.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Answer Form */}
                                    {showAnswerForm && selectedQuestionId === question.id && (
                                        <div className="ml-8 mt-4 bg-blue-50 p-4 rounded-lg">
                                            <h4 className="font-semibold mb-2">Answer Question</h4>
                                            <form onSubmit={handleAnswerQuestion}>
                                                <input
                                                    type="text"
                                                    placeholder="Your Name"
                                                    value={answerForm.sellerName}
                                                    onChange={(e) => setAnswerForm(prev => ({ ...prev, sellerName: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                                                    required
                                                />
                                                <textarea
                                                    placeholder="Your Answer"
                                                    value={answerForm.answer}
                                                    onChange={(e) => setAnswerForm(prev => ({ ...prev, answer: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                                                    rows={2}
                                                    required
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                                                    >
                                                        Submit Answer
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowAnswerForm(false);
                                                            setSelectedQuestionId(null);
                                                        }}
                                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Write a Review
                        </button>
                    </div>

                    {/* Review Form */}
                    {showReviewForm && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h3 className="font-semibold mb-4">Write a Review</h3>

                            {/* Success Message */}
                            {reviewSuccess && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                    <strong>Success!</strong> Your review has been submitted successfully.
                                </div>
                            )}

                            {/* Error Message */}
                            {reviewError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    <strong>Error:</strong> {reviewError}
                                </div>
                            )}

                            <form onSubmit={handleSubmitReview}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        value={reviewForm.customerName}
                                        onChange={(e) => setReviewForm(prev => ({ ...prev, customerName: e.target.value }))}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        disabled={isSubmittingReview}
                                    />
                                    <input
                                        type="email"
                                        placeholder="Your Email"
                                        value={reviewForm.customerEmail}
                                        onChange={(e) => setReviewForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        disabled={isSubmittingReview}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Review Title"
                                    value={reviewForm.title}
                                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                                    required
                                    disabled={isSubmittingReview}
                                />
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setReviewForm(prev => ({ ...prev, rating: i + 1 }))}
                                                className="text-2xl disabled:opacity-50"
                                                disabled={isSubmittingReview}
                                            >
                                                <FaStar
                                                    className={`h-6 w-6 ${i < reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    placeholder="Your Review"
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                                    rows={4}
                                    required
                                    disabled={isSubmittingReview}
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmittingReview}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmittingReview ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Review'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowReviewForm(false);
                                            setReviewError('');
                                            setReviewSuccess(false);
                                        }}
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                                        disabled={isSubmittingReview}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-4">
                        {reviews.length === 0 ? (
                            <p className="text-gray-600 text-center py-8">No reviews yet. Be the first to review!</p>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="border-b border-gray-200 pb-4">
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
                                        <span className="font-medium">{review.customerName}</span>
                                        <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                                        {review.verifiedPurchase && (
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Verified Purchase</span>
                                        )}
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                                    <p className="text-gray-700 mb-2">{review.comment}</p>
                                    <button className="text-sm text-blue-600 hover:text-blue-700">
                                        Helpful ({review.helpful})
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
