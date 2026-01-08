import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Qtybox from '../QtyBox';
import Rating from '@mui/material/Rating';
import { FaCartShopping } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";
import { IoIosGitCompare } from "react-icons/io";
import ColorPicker from '../product/ColorPicker';

const ProductDetalisComponent = ({ product, selectedColorVariant, onColorSelect }) => {
  const [productActionsIndex, setProductActionsIndex] = useState(false);

  // Handle color variant selection
  const handleColorSelect = (color) => {
    const variant = product?.colorVariants?.find(v => v.color === color.color);
    if (onColorSelect) {
      onColorSelect(variant);
    }
  };

  // Get current variant info
  const currentVariant = selectedColorVariant || (product?.colorVariants?.[0]);
  const hasColorVariants = product?.colorVariants && product.colorVariants.length > 0;
  const currentPrice = currentVariant?.price || product?.price;
  const currentStock = currentVariant?.stock || product?.stock;
  const currentSku = currentVariant?.sku || product?.sku;
  const currentImages = currentVariant?.images || [product?.image];

  const handleProductActions = (index) => {
    setProductActionsIndex(index);
  };

  return (
    <div className="productContanet w-full md:w-[60%] px-5 md:px-10">
      {/* Title */}
      <h1 className="text-[24px] md:text-[28px] font-[600] mb-3 leading-snug">
        {product?.name ?? (
          <>
            Siril Poly White & Beign Color Saree With Blouse Piece <br />
            | Sarees for Women | Saree | Saree
          </>
        )}
      </h1>

      {/* Brand + Rating + Review */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-gray-400 text-[14px]">
          Brands:{" "}
          <span className="font-[500] text-black opacity-75">
            {product?.brand || product?.category || "House of Chikankari"}
          </span>
        </span>
        <Rating name="size-small" defaultValue={4} size="small" readOnly />
        <span className="text-gray-500 text-[14px] cursor-pointer hover:underline">
          Review (5)
        </span>
      </div>

      {/* Price */}
      <div className="flex flex-wrap items-center gap-4 mt-2 mb-6">
        <span className="oldprice line-through text-gray-400 text-[20px] font-[500]">
          Rs. {product?.price ?? 999}
        </span>
        <span className="newprice text-[22px] font-[700] text-red-600">
          Rs. {currentPrice ?? 799}
        </span>
        <span className="text-gray-500 text-[14px] cursor-pointer mt-1">
          Available In Stock:{" "}
          <span className="text-green-600 text-[16px] font-bold">
            {typeof currentStock === "number" ? `${currentStock} Items` : "147 Items"}
          </span>
        </span>
        {hasColorVariants && currentVariant && (
          <span className="text-gray-500 text-[14px]">
            SKU: <span className="font-medium">{currentSku}</span>
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 text-[15px] leading-6 mb-6">
        {product?.description ?? (
          <>
            Our Chikankari kurta is a beautiful example of Lucknowi craftsmanship.
            Made from soft cotton fabric, it features intricate chikan hand embroidery
            on the front and back. The kurta is adorned with a delicate lace on the neckline
            and has a relaxed fit. Pair it with white linen pants and sandals for a stylish look.
          </>
        )}
      </p>

      {/* Sizes */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-gray-600 text-[16px] font-[500]">Size:</span>
        <div className="flex items-center gap-2">
          {(product?.sizes?.length ? product.sizes : ["S", "M", "L", "XL"]).map((size, index) => (
            <Button
              key={size}
              className={`!min-w-[50px] !rounded-md !py-1 !px-3 border ${productActionsIndex === index
                ? "!bg-black !text-white"
                : "!bg-gray-100 !text-gray-700 hover:!bg-black hover:!text-white"
                }`}
              onClick={() => handleProductActions(index)}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      {hasColorVariants && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-gray-600 text-[16px] font-[500]">Color:</span>
            <span className="text-gray-500 text-[14px]">
              {currentVariant?.colorName || 'Select a color'}
            </span>
          </div>
          <ColorPicker
            colors={product.colorVariants}
            selectedColor={currentVariant?.color}
            onColorSelect={handleColorSelect}
            size="medium"
            showLabels={true}
          />
        </div>
      )}

      {/* Shipping Info */}
      <p className="text-[15px] mb-4 text-[#000] font-[500]">
        ✅ Free Shipping (Est. Delivery Time 2-3 Days)
      </p>

      {/* Quantity + Add to Cart */}
      <div className="flex items-center gap-4 py-4">
        <div className="QtyBoxWrapper w-[80px]">
          <Qtybox />
        </div>
        <Button
          variant="contained"
          className="!bg-red-600 !text-white !px-6 !py-3 !rounded-md hover:!bg-black transition-all duration-300 flex items-center gap-2"
        >
          <FaCartShopping className="text-[20px]" /> Add To Cart
        </Button>
      </div>


      <div className="flex items-center gap-6 mt-6">
        <span className="flex items-center gap-2 text-[15px] cursor-pointer font-[500] text-gray-700 hover:text-red-600 transition-all">
          <FaRegHeart className="text-[18px]" /> Add to Wishlist
        </span>
        <span className="flex items-center gap-2 text-[15px] cursor-pointer font-[500] text-gray-700 hover:text-blue-600 transition-all">
          <IoIosGitCompare className="text-[18px]" /> Add to Compare
        </span>
      </div>
    </div>
  );
};

export default ProductDetalisComponent;
