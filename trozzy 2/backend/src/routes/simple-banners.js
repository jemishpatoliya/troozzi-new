const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Banner Schema (same as admin)
const BannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    image: { type: String, required: true },
    link: { type: String, default: '' },
    position: { type: String, required: true },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);

// GET /api/banners - Get banners by position
router.get('/', async (req, res) => {
    try {
        const { position } = req.query;

        if (position) {
            const activeBanners = await Banner.find({
                position: position,
                active: true
            }).sort({ order: 1, createdAt: -1 });

            return res.json({
                success: true,
                banners: activeBanners
            });
        }

        // If no position specified, return all active banners grouped by position
        const allBanners = await Banner.find({ active: true }).sort({ order: 1, createdAt: -1 });

        // Group banners by position
        const groupedBanners = {};
        allBanners.forEach(banner => {
            if (!groupedBanners[banner.position]) {
                groupedBanners[banner.position] = [];
            }
            groupedBanners[banner.position].push(banner);
        });

        res.json({
            success: true,
            banners: groupedBanners
        });
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch banners'
        });
    }
});

module.exports = router;
