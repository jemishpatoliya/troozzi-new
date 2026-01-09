const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
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
        const db = mongoose.connection.db;
        const docs = await db
            .collection('products')
            .find({}, { projection: { name: 1, sku: 1 } })
            .sort({ name: 1 })
            .toArray();
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
        const db = mongoose.connection.db;

        const filter = {};
        if (mode !== 'admin') {
            // public mode: only active products
            filter.status = { $in: ['active', 'published'] };
        }

        const docs = await db.collection('products').find(filter).sort({ createdAt: -1 }).toArray();
        res.json(docs.map(mapProduct));
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});

// GET /api/products/:id/management (admin)
router.get('/:id/management', authenticateAdmin, requireAdmin, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const { ObjectId } = require('mongodb');
        const doc = await db.collection('products').findOne({ _id: new ObjectId(req.params.id) });
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
        const db = mongoose.connection.db;

        const filter = { slug: String(req.params.slug) };
        if (mode !== 'admin') {
            filter.status = { $in: ['active', 'published'] };
            filter.visibility = 'public';
        }

        const doc = await db.collection('products').findOne(filter);
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
        const db = mongoose.connection.db;
        const { ObjectId } = require('mongodb');
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
            createdAt: now,
            updatedAt: now,
        };

        if (id) {
            await db.collection('products').updateOne({ _id: new ObjectId(id) }, { $set: { ...doc, updatedAt: now } });
            return res.json({ id: String(id) });
        }

        const result = await db.collection('products').insertOne(doc);
        res.json({ id: String(result.insertedId) });
    } catch (error) {
        console.error('Error saving draft:', error);
        res.status(500).json({ success: false, message: 'Failed to save draft' });
    }
});

// POST /api/products/publish (admin)
router.post('/publish', authenticateAdmin, requireAdmin, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const { ObjectId } = require('mongodb');
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
            await db.collection('products').updateOne({ _id: new ObjectId(id) }, { $set: doc });
            return res.json({ id: String(id) });
        }

        const created = { ...doc, createdAt: now };
        const result = await db.collection('products').insertOne(created);
        res.json({ id: String(result.insertedId) });
    } catch (error) {
        console.error('Error publishing product:', error);
        res.status(500).json({ success: false, message: 'Failed to publish product' });
    }
});

// PUT /api/products/:id (admin)
router.put('/:id', authenticateAdmin, requireAdmin, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const { ObjectId } = require('mongodb');
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

        await db.collection('products').updateOne(
            { _id: new ObjectId(req.params.id) },
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
        const db = mongoose.connection.db;
        const { ObjectId } = require('mongodb');
        const result = await db.collection('products').deleteOne({ _id: new ObjectId(req.params.id) });
        if (!result.deletedCount) return res.status(404).json({ success: false, message: 'Product not found' });
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
        const db = mongoose.connection.db;
        const { ObjectId } = require('mongodb');

        const filter = { _id: new ObjectId(req.params.id) };
        if (mode !== 'admin') {
            filter.status = { $in: ['active', 'published'] };
            filter.visibility = 'public';
        }

        const doc = await db.collection('products').findOne(filter);
        if (!doc) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json(mapProduct(doc));
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch product' });
    }
});

module.exports = router;
