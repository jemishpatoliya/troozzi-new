const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');

const { authenticateAdmin, requireAdmin } = require('../middleware/adminAuth');

// Protected admin routes
router.use(authenticateAdmin);
router.use(requireAdmin);

// GET /api/admin/reviews/stats - Get review statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await Review.getStats();
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching review stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch review statistics'
        });
    }
});

// POST /api/admin/reviews - Create a new review (for testing)
router.post('/', async (req, res) => {
    try {
        const reviewData = req.body;

        const review = new Review(reviewData);
        await review.save();

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            review
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create review'
        });
    }
});

// GET /api/admin/reviews - Get all reviews with pagination and filtering
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            rating,
            status,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        let query = Review.find({});

        if (search) {
            query = Review.find({
                $or: [
                    { customerName: { $regex: search, $options: 'i' } },
                    { customerEmail: { $regex: search, $options: 'i' } },
                    { productName: { $regex: search, $options: 'i' } },
                    { title: { $regex: search, $options: 'i' } },
                    { comment: { $regex: search, $options: 'i' } }
                ]
            });
        }

        // Apply filters
        if (rating) {
            query = query.where('rating').equals(parseInt(rating));
        }

        if (status) {
            query = query.where('status').equals(status);
        }

        // Sort
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        query = query.sort(sortOptions);

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [reviews, totalReviews] = await Promise.all([
            query.skip(skip).limit(limitNum),
            Review.countDocuments(query.getQuery())
        ]);

        const totalPages = Math.ceil(totalReviews / limitNum);

        res.json({
            reviews: reviews.map(r => ({ ...r.toObject ? r.toObject() : r, id: String(r._id) })),
            totalPages,
            currentPage: pageNum,
            totalReviews,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
});

// GET /api/admin/reviews/:id - Get single review
router.get('/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        res.json({ success: true, review });
    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch review' });
    }
});

// PUT /api/admin/reviews/:id/status - Update review status
router.put('/:id/status', async (req, res) => {
    try {
        const { status, reason } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        review.status = status;
        if (reason) {
            review.adminNotes = reason;
        }

        await review.save();

        res.json({
            success: true,
            message: `Review status updated to ${status}`,
            review
        });
    } catch (error) {
        console.error('Error updating review status:', error);
        res.status(500).json({ success: false, message: 'Failed to update review status' });
    }
});

// DELETE /api/admin/reviews/:id - Delete review
router.delete('/:id', async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ success: false, message: 'Failed to delete review' });
    }
});

module.exports = router;
