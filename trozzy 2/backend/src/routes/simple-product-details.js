const express = require('express');
const router = express.Router();
const { ProductModel } = require('../models/product');
const Review = require('../models/Review');
const mongoose = require('mongoose');

// Helper to find product by ID or slug
async function findProduct(idOrSlug) {
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        return await ProductModel.findById(idOrSlug);
    }
    return await ProductModel.findOne({ slug: idOrSlug });
}

// GET /api/product-details/:productId/details
router.get('/:productId/details', async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await findProduct(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const productLean = product.toObject();
        // Count approved reviews from separate collection
        const reviewCount = await Review.countDocuments({ productId: product._id, status: 'approved' });

        res.json({
            ...productLean,
            id: String(product._id),
            _id: String(product._id),
            reviewCount: reviewCount || (productLean.reviews ? productLean.reviews.length : 0)
        });
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch product details' });
    }
});

// GET /api/product-details/:productId/questions
router.get('/:productId/questions', async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const product = await findProduct(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const allQuestions = product.questions || [];
        const total = allQuestions.length;
        const questions = allQuestions.slice(skip, skip + limit);

        res.json({
            success: true,
            questions: questions.map(q => ({
                ...q,
                id: String(q._id || q.id),
                isAnswered: q.answers && q.answers.length > 0
            })),
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch questions' });
    }
});

// POST /api/product-details/:productId/questions
router.post('/:productId/questions', async (req, res) => {
    try {
        const { productId } = req.params;
        const { question, customerName, customerEmail } = req.body;

        if (!question || !customerName) {
            return res.status(400).json({ success: false, message: 'Question and name are required' });
        }

        const product = await findProduct(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const newQuestion = {
            _id: new mongoose.Types.ObjectId(),
            question,
            customerName,
            customerEmail,
            date: new Date().toISOString(),
            answers: [],
            upvotes: 0
        };

        if (!product.questions) product.questions = [];
        product.questions.push(newQuestion);
        await product.save();

        res.status(201).json({
            ...newQuestion,
            id: String(newQuestion._id),
            isAnswered: false
        });
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ success: false, message: 'Failed to add question' });
    }
});

// GET /api/product-details/:productId/reviews
router.get('/:productId/reviews', async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const sort = req.query.sort || 'recent';

        const product = await findProduct(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'helpful') sortOption = { helpful: -1 };
        if (sort === 'rating-high') sortOption = { rating: -1 };
        if (sort === 'rating-low') sortOption = { rating: 1 };

        const query = { productId: product._id, status: 'approved' };
        const total = await Review.countDocuments(query);
        const reviewsArr = await Review.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            success: true,
            reviews: reviewsArr.map(r => ({
                ...r,
                id: String(r._id),
                date: r.createdAt
            })),
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
});

// POST /api/product-details/:productId/reviews
router.post('/:productId/reviews', async (req, res) => {
    try {
        const { productId } = req.params;
        const reviewData = req.body;

        if (!reviewData.rating || !reviewData.title || !reviewData.comment || !reviewData.customerName || !reviewData.customerEmail) {
            return res.status(400).json({ success: false, message: 'Missing required review fields' });
        }

        const product = await findProduct(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const newReview = new Review({
            ...reviewData,
            productId: product._id,
            productName: product.name,
            status: 'pending', // Reviews need approval
            date: new Date().toISOString()
        });

        await newReview.save();

        res.status(201).json({
            ...newReview.toObject(),
            id: String(newReview._id),
            date: newReview.createdAt
        });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ success: false, message: 'Failed to submit review' });
    }
});

// POST /api/product-details/reviews/:reviewId/helpful
router.post('/reviews/:reviewId/helpful', async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        review.helpful = (review.helpful || 0) + 1;
        await review.save();

        res.json({ success: true, helpful: review.helpful });
    } catch (error) {
        console.error('Error marking review helpful:', error);
        res.status(500).json({ success: false, message: 'Failed to mark review helpful' });
    }
});

// POST /api/product-details/questions/:questionId/upvote
router.post('/questions/:questionId/upvote', async (req, res) => {
    try {
        const { questionId } = req.params;
        const product = await ProductModel.findOne({ 'questions._id': questionId });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const question = product.questions.id(questionId);
        question.upvotes = (question.upvotes || 0) + 1;
        await product.save();

        res.json({ success: true, upvotes: question.upvotes });
    } catch (error) {
        console.error('Error upvoting question:', error);
        res.status(500).json({ success: false, message: 'Failed to upvote question' });
    }
});

module.exports = router;
