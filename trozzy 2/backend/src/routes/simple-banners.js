const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Banner = require('../models/banner');

// GET /api/banners - Get banners by position
router.get('/', async (req, res) => {
    try {
        const { position } = req.query;

        if (position) {
            const activeBanners = await Banner.find({
                position: position,
                active: true
            }).sort({ order: 1, createdAt: -1 });

            const mappedBanners = activeBanners.map(b => ({
                id: b._id,
                title: b.title,
                imageUrl: b.image,
                linkUrl: b.link,
                position: b.position,
                active: b.active,
                order: b.order
            }));

            return res.json(mappedBanners);
        }

        const allBanners = await Banner.find({ active: true }).sort({ order: 1, createdAt: -1 });
        const mappedAll = allBanners.map(b => ({
            id: b._id,
            title: b.title,
            imageUrl: b.image,
            linkUrl: b.link,
            position: b.position,
            active: b.active,
            order: b.order
        }));

        res.json(mappedAll);
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch banners'
        });
    }
});

module.exports = router;
