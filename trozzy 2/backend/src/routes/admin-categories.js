const express = require('express');
const router = express.Router();

const { CategoryModel } = require('../models/category');
const { authenticateAdmin, requireAdmin } = require('../middleware/adminAuth');

// Apply authentication to all admin category routes
router.use(authenticateAdmin);
router.use(requireAdmin);

// GET /api/admin/categories - Get all categories with pagination
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await CategoryModel.countDocuments(query);
        const categories = await CategoryModel.find(query)
            .sort({ order: 1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        res.json({
            success: true,
            categories: categories.map(c => ({
                ...c,
                id: String(c._id),
                _id: String(c._id)
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching admin categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
});

// GET /api/admin/categories/:id - Get single category
router.get('/:id', async (req, res) => {
    try {
        const category = await CategoryModel.findById(req.params.id).lean();

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            category: {
                ...category,
                id: String(category._id),
                _id: String(category._id)
            }
        });
    } catch (error) {
        console.error('Error fetching admin category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category'
        });
    }
});

// POST /api/admin/categories - Create new category
router.post('/', async (req, res) => {
    try {
        const categoryData = req.body;

        // Generate slug from name
        const slug = categoryData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const newCategory = new CategoryModel({
            ...categoryData,
            slug,
            productCount: 0,
            active: categoryData.active !== undefined ? categoryData.active : true,
            order: categoryData.order || 0
        });

        await newCategory.save();

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category: {
                ...newCategory.toObject(),
                id: String(newCategory._id),
                _id: String(newCategory._id)
            }
        });
    } catch (error) {
        console.error('Error creating admin category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create category: ' + error.message
        });
    }
});

// PUT /api/admin/categories/:id - Update category
router.put('/:id', async (req, res) => {
    try {
        const updatedCategory = await CategoryModel.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                updatedAt: new Date()
            },
            { new: true }
        ).lean();

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category updated successfully',
            category: {
                ...updatedCategory,
                id: String(updatedCategory._id),
                _id: String(updatedCategory._id)
            }
        });
    } catch (error) {
        console.error('Error updating admin category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update category: ' + error.message
        });
    }
});

// DELETE /api/admin/categories/:id - Delete category
router.delete('/:id', async (req, res) => {
    try {
        // Check if category has children
        const hasChildren = await CategoryModel.exists({ parentId: req.params.id });
        if (hasChildren) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a category that has subcategories'
            });
        }

        const deleted = await CategoryModel.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting admin category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete category'
        });
    }
});

module.exports = router;
