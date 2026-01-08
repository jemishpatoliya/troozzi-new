import { api } from "./client";

export async function fetchCategories() {
    const res = await api.get("/categories");
    return res.data;
}

export async function fetchProducts({
    page,
    limit,
    mode = "public",
    category,
    featured,
    q,
    minPrice,
    maxPrice,
    inStock,
    onSale,
    freeShipping,
    rating,
    sizes,
    colors,
    brands,
    sort,
    order
} = {}) {
    const params = {};
    if (mode) params.mode = mode;
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (category) params.category = category;
    if (featured !== undefined) params.featured = featured;
    if (q) params.q = q;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;
    if (inStock !== undefined) params.inStock = inStock;
    if (onSale !== undefined) params.onSale = onSale;
    if (freeShipping !== undefined) params.freeShipping = freeShipping;
    if (rating !== undefined) params.rating = rating;
    if (sizes && sizes.length > 0) params.sizes = sizes.join(',');
    if (colors && colors.length > 0) params.colors = colors.join(',');
    if (brands && brands.length > 0) params.brands = brands.join(',');
    if (sort) params.sort = sort;
    if (order) params.order = order;

    const res = await api.get("/products", { params });
    return res.data;
}

export async function fetchProductById(id, { mode = "public" } = {}) {
    const res = await api.get(`/products/${id}`, { params: { mode } });
    return res.data;
}

export async function fetchProductBySlug(slug, { mode = "public" } = {}) {
    const res = await api.get(`/products/slug/${slug}`, { params: { mode } });
    return res.data;
}

export async function fetchBanners({ position } = {}) {
    const params = {};
    if (position) params.position = position;
    const res = await api.get("/banners", { params });
    return res.data;
}
