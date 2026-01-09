const express = require('express');
const router = express.Router();
const { ProductModel } = require('../models/product');
const { authenticateAdmin, requireAdmin } = require('../middleware/adminAuth');

function mapProduct(p) {
    const doc = p._doc || p;
    return {
        _id: String(doc._id),
        id: String(doc._id),
        slug: doc.slug,
        visibility: doc.visibility,
        name: doc.name,
        sku: doc.sku,
        price: doc.price,
        stock: doc.stock,
        status: doc.status,
        image: doc.image,
        galleryImages: doc.galleryImages,
        category: doc.category,
        description: doc.description,
        featured: doc.featured,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        sizes: doc.sizes,
        colors: doc.colors,
        colorVariants: doc.colorVariants,
        variants: doc.variants,
        tags: doc.tags,
        keyFeatures: doc.keyFeatures,
        warranty: doc.warranty,
        warrantyDetails: doc.warrantyDetails,
        saleEnabled: doc.saleEnabled,
        saleDiscount: doc.saleDiscount,
        saleStartDate: doc.saleStartDate,
        saleEndDate: doc.saleEndDate,
        metaTitle: doc.metaTitle,
        metaDescription: doc.metaDescription,
        weight: doc.weight,
        dimensions: doc.dimensions,
        badge: doc.badge,
        brand: doc.brand,
    };
}

// GET /api/admin/products - Get all products
router.get('/', authenticateAdmin, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category } = req.query;
        const db = mongoose.connection.db;

        // Build filter
        const filter = {};
        if (category) {
            filter.category = category;
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { sku: searchRegex },
                { brand: searchRegex }
            ];
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            ProductModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
            ProductModel.countDocuments(filter)
        ]);

        const mappedProducts = products.map(mapProduct);

        res.json({
            success: true,
            products: mappedProducts,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products'
        });
    }
});

// GET /api/admin/products/:id - Get single product
router.get('/:id', authenticateAdmin, requireAdmin, async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id).lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product: mapProduct(product)
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product'
        });
    }
});

// POST /api/admin/products - Create new product
router.post('/', authenticateAdmin, requireAdmin, async (req, res) => {
    try {
        const productData = req.body;
        const db = mongoose.connection.db;

        // Generate slug from name
        const slug = productData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const newProduct = {
            ...productData,
            slug,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await ProductModel.create(newProduct);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: mapProduct(result)
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product'
        });
    }
});

// PUT /api/admin/products/:id - Update product
router.put('/:id', authenticateAdmin, requireAdmin, async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const updatedProduct = await ProductModel.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        ).lean();

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: mapProduct(updatedProduct)
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product'
        });
    }
});

// DELETE /api/admin/products/:id - Delete product
router.delete('/:id', authenticateAdmin, requireAdmin, async (req, res) => {
    try {
        const result = await ProductModel.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product'
        });
    }
});

module.exports = router;
