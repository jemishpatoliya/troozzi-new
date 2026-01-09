const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ProductModel } = require('../models/product');
const { authenticateAdmin, requireAdmin } = require('../middleware/adminAuth');

function mapProduct(p) {
    return {
        _id: String(p._id),
        id: String(p._id),
        slug: p.slug,
        visibility: p.visibility,
        name: p.name,
        sku: p.sku,
        price: p.price,
        stock: p.stock,
        status: p.status,
        image: p.image,
        galleryImages: p.galleryImages,
        category: p.category,
        description: p.description,
        featured: p.featured,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        management: p.management,
    };
}

// GET /api/products/catalog (admin)
router.get('/catalog', authenticateAdmin, requireAdmin, async (req, res) => {
    try {
        const docs = await ProductModel.find({}, { name: 1, sku: 1 }).sort({ name: 1 }).lean();
        res.json(docs.map((p) => ({ id: String(p._id), name: p.name ?? '', sku: p.sku ?? '' })));
    } catch (error) {
        console.error('Error fetching catalog products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch catalog products' });
    }
});

// GET /api/products (mode=admin requires token, mode=public is open)
router.get('/', async (req, res, next) => {
    const mode = String(req.query?.mode ?? 'public');
    if (mode === 'admin') return authenticateAdmin(req, res, () => requireAdmin(req, res, next));
    return next();
});

router.get('/', async (req, res) => {
    try {
        const mode = String(req.query?.mode ?? 'public');
        const { page = 1, limit = 12, category, featured, q, minPrice, maxPrice, inStock, onSale, freeShipping, rating, sizes, colors, brands, sort = 'createdAt', order = 'desc' } = req.query;

        const filter = {};

        // Mode-based visibility
        if (mode !== 'admin') {
            filter.status = { $in: ['active', 'published'] };
            filter.visibility = 'public';
        }

        // Search
        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { sku: { $regex: q, $options: 'i' } }
            ];
        }

        // Filters
        if (category) filter.category = category;
        if (featured !== undefined) filter.featured = featured === 'true';
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
            if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
        }
        if (inStock === 'true') filter.stock = { $gt: 0 };
        if (onSale === 'true') filter.saleEnabled = true;
        if (freeShipping === 'true') filter.freeShipping = true;
        if (rating !== undefined) filter.rating = { $gte: Number(rating) };

        // Array filters
        if (sizes) filter.sizes = { $in: sizes.split(',') };
        if (colors) filter.colors = { $in: colors.split(',') };
        if (brands) filter.brand = { $in: brands.split(',') };

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Sorting
        const sortOrder = order === 'asc' ? 1 : -1;
        const sortOptions = { [sort]: sortOrder };

        const [docs, total] = await Promise.all([
            ProductModel.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
            ProductModel.countDocuments(filter)
        ]);

        res.json({
            success: true,
            items: docs.map(mapProduct),
            totalItems: total,
            totalPages: Math.ceil(total / limitNum),
            page: pageNum,
            limit: limitNum
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});

// GET /api/products/:id/management (admin)
router.get('/:id/management', authenticateAdmin, requireAdmin, async (req, res) => {
    try {
        const doc = await ProductModel.findById(req.params.id).lean();
        if (!doc) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json(doc.management ?? {});
    } catch (error) {
        console.error('Error fetching product management:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch product management' });
    }
});

// GET /api/products/slug/:slug (mode=admin requires token, mode=public is open)
router.get('/slug/:slug', async (req, res, next) => {
    const mode = String(req.query?.mode ?? 'public');
    if (mode === 'admin') return authenticateAdmin(req, res, () => requireAdmin(req, res, next));
    return next();
});

router.get('/slug/:slug', async (req, res) => {
    try {
        const mode = String(req.query?.mode ?? 'public');
        const doc = await ProductModel.findOne(filter).lean();
        if (!doc) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json(mapProduct(doc));
    } catch (error) {
        console.error('Error fetching product by slug:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch product' });
    }
});

// POST /api/products/draft (admin)
router.post('/draft', authenticateAdmin, requireAdmin, async (req, res) => {
    try {
        if (id) {
            await ProductModel.findByIdAndUpdate(id, { $set: { ...doc, updatedAt: now } });
            return res.json({ id: String(id) });
        }

        const result = await ProductModel.create(doc);
        res.json({ id: String(result._id) });
    } catch (error) {
        console.error('Error saving draft:', error);
        res.status(500).json({ success: false, message: 'Failed to save draft' });
    }
});

// POST /api/products/draft (admin)
router.post('/draft', authenticateAdmin, requireAdmin, async (req, res) => {
    try {
        const id = req.body?.id;
        const values = req.body?.values;
        if (!values) return res.status(400).json({ success: false, message: 'Missing values' });

        const now = new Date();
        const base = values?.basic ?? {};
        const pricing = values?.pricing ?? {};
        const inventory = values?.inventory ?? {};
        const media = values?.media ?? {};

        const images = Array.isArray(media?.images) ? media.images : [];
        const thumbId = media?.thumbnailId ?? null;
        const thumb = thumbId ? images.find((i) => i?.id === thumbId) : null;
        const primaryImageUrl = String((thumb?.url ?? images[0]?.url ?? '') || '');
        const galleryImages = images
            .map((i) => i?.url)
            .filter((u) => typeof u === 'string' && u.trim().length)
            .map((u) => String(u));

        const categoryIds = Array.isArray(base?.categoryIds) ? base.categoryIds : [];
        const category = String(categoryIds[0] ?? '');

        const doc = {
            slug: base.slug,
            visibility: base.visibility,
            name: base.name,
            sku: inventory.sku,
            price: pricing.sellingPrice,
            stock: inventory.stockQuantity,
            status: 'draft',
            image: primaryImageUrl,
            galleryImages,
            category,
            description: base.shortDescription ?? '',
            featured: !!(values?.marketing?.featured),
            management: values,
            updatedAt: now,
        };

        if (id) {
            await ProductModel.findByIdAndUpdate(id, { $set: doc });
            return res.json({ id: String(id) });
        }

        const result = await ProductModel.create({ ...doc, createdAt: now });
        res.json({ id: String(result._id) });
    } catch (error) {
        console.error('Error saving draft:', error);
        res.status(500).json({ success: false, message: 'Failed to save draft' });
    }
});

// POST /api/products/publish (admin)
router.post('/publish', authenticateAdmin, requireAdmin, async (req, res) => {
    try {
        const id = req.body?.id;
        const values = req.body?.values;
        if (!values) return res.status(400).json({ success: false, message: 'Missing values' });

        const now = new Date();
        const base = values?.basic ?? {};
        const pricing = values?.pricing ?? {};
        const inventory = values?.inventory ?? {};
        const media = values?.media ?? {};

        const images = Array.isArray(media?.images) ? media.images : [];
        const thumbId = media?.thumbnailId ?? null;
        const thumb = thumbId ? images.find((i) => i?.id === thumbId) : null;
        const primaryImageUrl = String((thumb?.url ?? images[0]?.url ?? '') || '');
        const galleryImages = images
            .map((i) => i?.url)
            .filter((u) => typeof u === 'string' && u.trim().length)
            .map((u) => String(u));

        const categoryIds = Array.isArray(base?.categoryIds) ? base.categoryIds : [];
        const category = String(categoryIds[0] ?? '');

        const doc = {
            slug: base.slug,
            visibility: base.visibility,
            name: base.name,
            sku: inventory.sku,
            price: pricing.sellingPrice,
            stock: inventory.stockQuantity,
            status: 'active',
            image: primaryImageUrl,
            galleryImages,
            category,
            description: base.shortDescription ?? '',
            featured: !!(values?.marketing?.featured),
            management: values,
            updatedAt: now,
        };

        if (id) {
            await ProductModel.findByIdAndUpdate(id, { $set: doc });
            return res.json({ id: String(id) });
        }

        const result = await ProductModel.create({ ...doc, createdAt: now });
        res.json({ id: String(result._id) });
    } catch (error) {
        console.error('Error publishing product:', error);
        res.status(500).json({ success: false, message: 'Failed to publish product' });
    }
});

// PUT /api/products/:id (admin)
router.put('/:id', authenticateAdmin, requireAdmin, async (req, res) => {
    try {
        const values = req.body?.values;
        if (!values) return res.status(400).json({ success: false, message: 'Missing values' });

        const now = new Date();
        const base = values?.basic ?? {};
        const media = values?.media ?? {};

        const images = Array.isArray(media?.images) ? media.images : [];
        const thumbId = media?.thumbnailId ?? null;
        const thumb = thumbId ? images.find((i) => i?.id === thumbId) : null;
        const primaryImageUrl = String((thumb?.url ?? images[0]?.url ?? '') || '');
        const galleryImages = images
            .map((i) => i?.url)
            .filter((u) => typeof u === 'string' && u.trim().length)
            .map((u) => String(u));

        const categoryIds = Array.isArray(base?.categoryIds) ? base.categoryIds : [];
        const category = String(categoryIds[0] ?? '');

        await ProductModel.findByIdAndUpdate(
            req.params.id,
            { $set: { management: values, image: primaryImageUrl, galleryImages, category, updatedAt: now } }
        );
        res.json({ id: req.params.id });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Failed to update product' });
    }
});

// DELETE /api/products/:id (admin)
router.delete('/:id', authenticateAdmin, requireAdmin, async (req, res) => {
    try {
        const result = await ProductModel.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ ok: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
});

// GET /api/products/:id (mode=admin requires token, mode=public is open)
router.get('/:id', async (req, res, next) => {
    const mode = String(req.query?.mode ?? 'public');
    if (mode === 'admin') return authenticateAdmin(req, res, () => requireAdmin(req, res, next));
    return next();
});

router.get('/:id', async (req, res) => {
    try {
        const mode = String(req.query?.mode ?? 'public');
        const doc = await ProductModel.findById(req.params.id).lean();
        if (!doc) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json(mapProduct(doc));
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch product' });
    }
});

module.exports = router;
