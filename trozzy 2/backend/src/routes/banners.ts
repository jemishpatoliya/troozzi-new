import { Router, type Request, type Response } from "express";
import { BannerModel } from "../models/banner";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const position = req.query.position ? String(req.query.position) : "";
    let filter: any = { active: true };

    if (position) {
      filter.position = position;
    }

    const banners = await BannerModel.find(filter).sort({ order: 1, createdAt: -1 });
    
    // Map fields for backward compatibility if needed
    const result = banners.map(b => ({
      id: b._id,
      title: b.title,
      imageUrl: b.image,
      linkUrl: b.link,
      position: b.position,
      active: b.active,
      order: b.order
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

export default router;
