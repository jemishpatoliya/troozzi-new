import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";

import { fetchCategories, fetchProducts } from "../../api/catalog";

const PopularProducts = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchCategories();
        if (cancelled) return;

        const top = (Array.isArray(data) ? data : [])
          .filter((c) => c && c.active)
          .filter((c) => !c.parentId)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        setCategories(top);
        if (!activeCategory && top.length > 0) {
          setActiveCategory(top[0].name);
        }
      } catch (e) {
        if (cancelled) return;
        setCategories([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!activeCategory) return;
      try {
        const data = await fetchProducts({ mode: "public", page: 1, limit: 60, category: activeCategory });
        if (cancelled) return;
        const items = Array.isArray(data) ? data : (data.items || []);
        setProducts(items);
      } catch (e) {
        if (!cancelled) setProducts([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories]);

  return (
    <div className="py-16 px-6 bg-white">
      <div className="">
        <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Popular Products</h2>
        <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
          Discover our most loved products. Handpicked favorites that customers can't get enough of.
        </p>

        {/* Categories */}
        <div className="flex overflow-x-auto scrollbar-hide justify-start md:justify-center gap-3 border-b border-gray-200 pb-4 mb-10">
          {categoryNames.map((cat, i) => (
            <button
              key={i}
              className={`px-6 py-1.5 whitespace-nowrap rounded-full font-medium transition-all ${activeCategory === cat
                ? "bg-red-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularProducts;
