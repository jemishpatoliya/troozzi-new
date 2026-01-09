import { Router, Request, Response } from 'express';
import { BannerModel } from '../models/banner';
import { authenticateAdmin } from '../middleware/adminAuth';

const router = Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// GET /api/admin/banners - Get all banners
router.get('/', async (req: Request, res: Response) => {
  try {
    const { position, active } = req.query;
    let filter: any = {};

    if (position) {
      filter.position = position;
    }

    if (active !== undefined) {
      filter.active = active === 'true';
    }

    const banners = await BannerModel.find(filter).sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      banners: banners
    });
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners'
    });
  }
});

// GET /api/admin/banners/:id - Get single banner
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const banner = await BannerModel.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.json({
      success: true,
      banner: banner
    });
  } catch (error: any) {
    console.error('Error fetching banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banner'
    });
  }
});

// POST /api/admin/banners - Create new banner
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, subtitle, image, link, position, active, order } = req.body;

    if (!title || !position || !image) {
      return res.status(400).json({
        success: false,
        message: 'Title, position, and image are required'
      });
    }

    const newBanner = new BannerModel({
      title,
      subtitle: subtitle || '',
      image,
      link: link || '',
      position,
      active: active !== undefined ? active === true : true,
      order: order !== undefined ? parseInt(order as any) : 0
    });

    await newBanner.save();

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      banner: newBanner
    });
  } catch (error: any) {
    console.error('Error creating banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create banner: ' + error.message
    });
  }
});

// PUT /api/admin/banners/:id - Update banner
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, subtitle, image, link, position, active, order } = req.body;
    
    const banner = await BannerModel.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // Update fields
    if (title !== undefined) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (image !== undefined) banner.image = image;
    if (link !== undefined) banner.link = link;
    if (position !== undefined) banner.position = position;
    if (active !== undefined) banner.active = active === true;
    if (order !== undefined) banner.order = parseInt(order as any);

    await banner.save();

    res.json({
      success: true,
      message: 'Banner updated successfully',
      banner: banner
    });
  } catch (error: any) {
    console.error('Error updating banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update banner: ' + error.message
    });
  }
});

// DELETE /api/admin/banners/:id - Delete banner
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const banner = await BannerModel.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner'
    });
  }
});

export default router;
