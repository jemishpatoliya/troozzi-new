import { Router } from "express";
import { z } from "zod";
import { CategoryModel } from "../models/category";
import { ProductModel } from "../models/product";
import { productManagementSchema } from "../validation/productManagement";
const router = Router();
function parseIntQuery(value) {
    if (value === undefined || value === null)
        return undefined;
    const n = Number.parseInt(String(value), 10);
    if (!Number.isFinite(n))
        return undefined;
    return n;
}
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function mapProduct(p) {
    return {
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
        sizes: p.sizes,
        colors: p.colors,
        colorVariants: p.colorVariants,
        variants: p.variants,
        tags: p.tags,
        keyFeatures: p.keyFeatures,
        warranty: p.warranty,
        warrantyDetails: p.warrantyDetails,
        saleEnabled: p.saleEnabled,
        saleDiscount: p.saleDiscount,
        saleStartDate: p.saleStartDate,
        saleEndDate: p.saleEndDate,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        weight: p.weight,
        dimensions: p.dimensions,
        badge: p.badge,
        brand: p.brand,
    };
}
function mapStatusToCatalogStatus(status) {
    if (status === "active")
        return "active";
    if (status === "draft")
        return "draft";
    return "inactive";
}
router.get("/catalog", async (_req, res) => {
    const products = await ProductModel.find({}, { name: 1, sku: 1 }).sort({ createdAt: -1 }).lean();
    res.json(products.map((p) => ({ id: String(p._id), name: p.name, sku: p.sku })));
});
router.get("/", async (req, res) => {
    const mode = String(req.query.mode ?? "admin");
    const filter = {};
    if (mode === "public") {
        filter.status = "active";
        filter.visibility = "public";
    }
    const category = req.query.category ? String(req.query.category) : "";
    if (category) {
        filter.category = category;
    }
    const featured = req.query.featured === undefined ? undefined : String(req.query.featured);
    if (featured === "true") {
        filter.featured = true;
    }
    if (featured === "false") {
        filter.featured = false;
    }
    // Search query
    const q = String(req.query.q ?? "").trim();
    if (q) {
        const rx = new RegExp(escapeRegExp(q), "i");
        filter.$or = [{ name: rx }, { sku: rx }, { brand: rx }, { category: rx }, { tags: rx }];
    }
    // Price range filtering
    const minPrice = parseIntQuery(req.query.minPrice);
    const maxPrice = parseIntQuery(req.query.maxPrice);
    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined)
            filter.price.$gte = minPrice;
        if (maxPrice !== undefined)
            filter.price.$lte = maxPrice;
    }
    // Stock filtering
    const inStock = req.query.inStock === "true";
    if (inStock) {
        filter.stock = { $gt: 0 };
    }
    // Sale filtering
    const onSale = req.query.onSale === "true";
    if (onSale) {
        filter.saleEnabled = true;
        const now = new Date();
        filter.$and = filter.$and || [];
        filter.$and.push({
            $or: [
                { saleStartDate: { $lte: now }, saleEndDate: { $gte: now } },
                { saleStartDate: { $lte: now }, saleEndDate: { $exists: false } },
                { saleStartDate: { $exists: false }, saleEndDate: { $gte: now } },
                { saleStartDate: { $exists: false }, saleEndDate: { $exists: false } }
            ]
        });
    }
    // Free shipping filtering
    const freeShipping = req.query.freeShipping === "true";
    if (freeShipping) {
        filter.freeShipping = true;
    }
    // Rating filtering (average rating from reviews would need to be calculated)
    const minRating = parseIntQuery(req.query.rating);
    if (minRating !== undefined && minRating > 0) {
        // This would require a reviews collection or rating field in products
        // For now, we'll assume products have a rating field
        filter.rating = { $gte: minRating };
    }
    // Size filtering
    const sizes = req.query.sizes;
    if (sizes && typeof sizes === "string") {
        const sizeArray = sizes.split(",").filter(s => s.trim());
        if (sizeArray.length > 0) {
            filter.sizes = { $in: sizeArray };
        }
    }
    else if (Array.isArray(sizes)) {
        const sizeArray = sizes.filter(s => typeof s === "string" && s.trim());
        if (sizeArray.length > 0) {
            filter.sizes = { $in: sizeArray };
        }
    }
    // Color filtering
    const colors = req.query.colors;
    if (colors && typeof colors === "string") {
        const colorArray = colors.split(",").filter(c => c.trim());
        if (colorArray.length > 0) {
            filter.colors = { $in: colorArray };
        }
    }
    else if (Array.isArray(colors)) {
        const colorArray = colors.filter(c => typeof c === "string" && c.trim());
        if (colorArray.length > 0) {
            filter.colors = { $in: colorArray };
        }
    }
    // Brand filtering
    const brands = req.query.brands;
    if (brands && typeof brands === "string") {
        const brandArray = brands.split(",").filter(b => b.trim());
        if (brandArray.length > 0) {
            filter.brand = { $in: brandArray };
        }
    }
    else if (Array.isArray(brands)) {
        const brandArray = brands.filter(b => typeof b === "string" && b.trim());
        if (brandArray.length > 0) {
            filter.brand = { $in: brandArray };
        }
    }
    // Sorting
    const sort = String(req.query.sort ?? "createdAt");
    const order = String(req.query.order ?? "desc");
    const sortOptions = {};
    switch (sort) {
        case "price_asc":
            sortOptions.price = 1;
            break;
        case "price_desc":
            sortOptions.price = -1;
            break;
        case "name_asc":
            sortOptions.name = 1;
            break;
        case "name_desc":
            sortOptions.name = -1;
            break;
        case "rating_desc":
            sortOptions.rating = -1;
            break;
        case "newest":
            sortOptions.createdAt = -1;
            break;
        case "relevance":
        default:
            sortOptions.createdAt = -1;
            break;
    }
    // Pagination
    const page = parseIntQuery(req.query.page);
    const limit = parseIntQuery(req.query.limit);
    const shouldPaginate = page !== undefined || limit !== undefined;
    if (shouldPaginate) {
        const safePage = Math.max(1, page ?? 1);
        const safeLimit = Math.min(100, Math.max(1, limit ?? 24));
        const skip = (safePage - 1) * safeLimit;
        const [total, docs] = await Promise.all([
            ProductModel.countDocuments(filter),
            ProductModel.find(filter).sort(sortOptions).skip(skip).limit(safeLimit).lean(),
        ]);
        const totalPages = Math.max(1, Math.ceil(total / safeLimit));
        return res.json({
            items: docs.map(mapProduct),
            page: safePage,
            limit: safeLimit,
            total,
            totalPages,
            totalItems: total,
        });
    }
    const products = await ProductModel.find(filter).sort(sortOptions).lean();
    res.json(products.map(mapProduct));
});
router.get("/slug/:slug", async (req, res) => {
    const mode = String(req.query.mode ?? "admin");
    const filter = { slug: req.params.slug };
    if (mode === "public") {
        filter.status = "active";
        filter.visibility = "public";
    }
    const p = await ProductModel.findOne(filter).lean();
    if (!p)
        return res.status(404).json({ message: "Product not found" });
    res.json({
        ...mapProduct(p),
    });
});
router.get("/:id", async (req, res) => {
    const mode = String(req.query.mode ?? "admin");
    const filter = { _id: req.params.id };
    if (mode === "public") {
        filter.status = "active";
        filter.visibility = "public";
    }
    const p = await ProductModel.findOne(filter).lean();
    if (!p)
        return res.status(404).json({ message: "Product not found" });
    res.json(mapProduct(p));
});
router.get("/:id/management", async (req, res) => {
    const product = await ProductModel.findById(req.params.id).lean();
    if (!product)
        return res.status(404).json({ message: "Product not found" });
    if (!product.management)
        return res.status(404).json({ message: "Management data not found" });
    res.json(product.management);
});
const saveBodySchema = z.object({ values: productManagementSchema });
async function upsertFromManagement(id, values) {
    const categories = await CategoryModel.find({}).lean();
    const categoryId = values.basic?.categoryIds?.[0];
    const categoryName = categoryId ? categories.find((c) => String(c._id) === String(categoryId))?.name : undefined;
    const thumbnailUrl = values.media?.thumbnailId
        ? values.media?.images?.find((i) => i.id === values.media.thumbnailId)?.url
        : values.media?.images?.[0]?.url;
    const next = {
        slug: values.basic.slug,
        visibility: values.basic.visibility,
        name: values.basic.name,
        sku: values.inventory.sku,
        price: values.pricing.sellingPrice,
        stock: values.inventory.stockQuantity,
        status: mapStatusToCatalogStatus(values.basic.status),
        image: thumbnailUrl ?? "",
        galleryImages: (values.media.images ?? []).map((i) => i.url),
        category: categoryName ?? "",
        description: values.basic.shortDescription ?? "",
        featured: !!values.marketing.featured,
        tags: values.seo.metaKeywords ?? [],
        keyFeatures: (values.details.technicalSpecs ?? []).map((kv) => kv.key).filter(Boolean),
        warranty: values.details.warrantyInfo ?? "",
        warrantyDetails: values.details.returnPolicy ?? "",
        saleEnabled: !!values.marketing.scheduleSale?.enabled,
        saleDiscount: 0,
        saleStartDate: values.marketing.scheduleSale?.startDate ?? "",
        saleEndDate: values.marketing.scheduleSale?.endDate ?? "",
        metaTitle: values.seo.metaTitle ?? "",
        metaDescription: values.seo.metaDescription ?? "",
        weight: values.shipping.weightKg ?? 0,
        dimensions: values.shipping.dimensionsCm ?? { length: 0, width: 0, height: 0 },
        badge: values.marketing.saleBadge ? "sale" : "",
        brand: values.basic.brand ?? "",
        colorVariants: values.variants?.colorVariants || [],
        management: values,
        managementUpdatedAt: new Date().toISOString(),
    };
    await ProductModel.findByIdAndUpdate(id, { $set: next, $setOnInsert: { createdAt: new Date().toISOString().split("T")[0] } }, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
    });
}
router.post("/draft", async (req, res) => {
    const parsed = saveBodySchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid body", issues: parsed.error.issues });
    const id = req.body?.id;
    const values = parsed.data.values;
    const draftValues = { ...values, basic: { ...values.basic, status: "draft" } };
    if (id) {
        await upsertFromManagement(id, draftValues);
        return res.json({ id });
    }
    const createdAt = new Date().toISOString().split("T")[0];
    const doc = await ProductModel.create({
        slug: draftValues.basic.slug,
        visibility: draftValues.basic.visibility,
        name: draftValues.basic.name,
        sku: draftValues.inventory.sku,
        price: draftValues.pricing.sellingPrice,
        stock: draftValues.inventory.stockQuantity,
        status: mapStatusToCatalogStatus("draft"),
        image: "",
        galleryImages: [],
        category: "",
        description: draftValues.basic.shortDescription ?? "",
        featured: !!draftValues.marketing.featured,
        createdAt,
        sizes: [],
        colors: [],
        colorVariants: [],
        variants: [],
        tags: [],
        keyFeatures: [],
        warranty: "",
        warrantyDetails: "",
        saleEnabled: false,
        saleDiscount: 0,
        saleStartDate: "",
        saleEndDate: "",
        metaTitle: "",
        metaDescription: "",
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        badge: "",
        brand: "",
        management: draftValues,
        managementUpdatedAt: new Date().toISOString(),
    });
    await upsertFromManagement(String(doc._id), draftValues);
    res.json({ id: String(doc._id) });
});
router.post("/publish", async (req, res) => {
    const parsed = saveBodySchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid body", issues: parsed.error.issues });
    const id = req.body?.id;
    const values = parsed.data.values;
    const nextValues = { ...values, basic: { ...values.basic, status: "active" } };
    if (id) {
        await upsertFromManagement(id, nextValues);
        return res.json({ id });
    }
    const createdAt = new Date().toISOString().split("T")[0];
    const doc = await ProductModel.create({
        slug: nextValues.basic.slug,
        visibility: nextValues.basic.visibility,
        name: nextValues.basic.name,
        sku: nextValues.inventory.sku,
        price: nextValues.pricing.sellingPrice,
        stock: nextValues.inventory.stockQuantity,
        status: mapStatusToCatalogStatus("active"),
        image: "",
        galleryImages: [],
        category: "",
        description: nextValues.basic.shortDescription ?? "",
        featured: !!nextValues.marketing.featured,
        createdAt,
        sizes: [],
        colors: [],
        colorVariants: [],
        variants: [],
        tags: [],
        keyFeatures: [],
        warranty: "",
        warrantyDetails: "",
        saleEnabled: false,
        saleDiscount: 0,
        saleStartDate: "",
        saleEndDate: "",
        metaTitle: "",
        metaDescription: "",
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        badge: "",
        brand: "",
        management: nextValues,
        managementUpdatedAt: new Date().toISOString(),
    });
    await upsertFromManagement(String(doc._id), nextValues);
    res.json({ id: String(doc._id) });
});
router.put("/:id", async (req, res) => {
    const parsed = saveBodySchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid body", issues: parsed.error.issues });
    const product = await ProductModel.findById(req.params.id);
    if (!product)
        return res.status(404).json({ message: "Product not found" });
    await upsertFromManagement(req.params.id, parsed.data.values);
    res.json({ id: req.params.id });
});
router.delete("/:id", async (req, res) => {
    await ProductModel.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
});
router.post("/bulk/status", async (req, res) => {
    const parsed = z.object({ ids: z.array(z.string()).min(1), status: z.enum(["active", "inactive", "draft"]) }).safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid body", issues: parsed.error.issues });
    await ProductModel.updateMany({ _id: { $in: parsed.data.ids } }, { $set: { status: parsed.data.status } });
    res.json({ ok: true });
});
export default router;
