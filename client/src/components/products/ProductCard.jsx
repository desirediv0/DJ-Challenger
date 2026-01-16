"use client";

import Link from "next/link";
import {  Heart, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { fetchApi, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Helper function to format image URLs correctly
const getImageUrl = (image) => {
  if (!image) return "/placeholder.jpg";
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

// Helper function to calculate discount percentage
const calculateDiscountPercentage = (regularPrice, salePrice) => {
  if (!regularPrice || !salePrice || regularPrice <= salePrice) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
};

export const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  
  // Logic from user request
  const [wishlistItems, setWishlistItems] = useState({});
  const [isAddingToWishlist, setIsAddingToWishlist] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [priceVisibilitySettings, setPriceVisibilitySettings] = useState(null);


  // 1. Fetch wishlist status
  useEffect(() => {
    const fetchWishlistStatus = async () => {
      if (!isAuthenticated || typeof window === "undefined") return;

      try {
        const response = await fetchApi("/users/wishlist", {
          credentials: "include",
        });
        const items =
          response.data?.wishlistItems?.reduce((acc, item) => {
            acc[item.productId] = true;
            return acc;
          }, {}) || {};
        setWishlistItems(items);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    fetchWishlistStatus();
  }, [isAuthenticated]);

  // 2. Fetch price visibility settings
  useEffect(() => {
    const fetchPriceVisibilitySettings = async () => {
      try {
        const response = await fetchApi("/public/price-visibility-settings");
        if (response.success) {
          setPriceVisibilitySettings(response.data);
        }
      } catch (error) {
        console.error("Error fetching price visibility settings:", error);
        setPriceVisibilitySettings({ hidePricesForGuests: false });
      }
    };

    fetchPriceVisibilitySettings();
  }, []);

  // 3. Handle Wishlist Toggle
  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent navigation to product page

    if (!isAuthenticated) {
      router.push(`/auth?redirect=/products/${product.slug}`);
      return;
    }

    // Optimistic update
    setIsAddingToWishlist((prev) => ({ ...prev, [product.id]: true }));

    try {
      if (wishlistItems[product.id]) {
        // Remove from wishlist
        const wishlistResponse = await fetchApi("/users/wishlist", {
          credentials: "include",
        });

        const wishlistItem = wishlistResponse.data?.wishlistItems?.find(
          (item) => item.productId === product.id
        );

        if (wishlistItem) {
          await fetchApi(`/users/wishlist/${wishlistItem.id}`, {
            method: "DELETE",
            credentials: "include",
          });

          setWishlistItems((prev) => {
            const newState = { ...prev };
            delete newState[product.id];
            return newState;
          });
          
        }
      } else {
        // Add to wishlist
        await fetchApi("/users/wishlist", {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ productId: product.id }),
        });

        setWishlistItems((prev) => ({ ...prev, [product.id]: true }));
        
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setIsAddingToWishlist((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  // 4. Image Handling Logic
  const getAllProductImages = useMemo(() => {
    const images = [];
    const imageUrls = new Set();

    // Priority 1: Variant images
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((variant) => {
        if (variant.images && Array.isArray(variant.images)) {
          variant.images.forEach((img) => {
            const url = img?.url || img;
            if (url) {
              const imageUrl = getImageUrl(url);
              if (!imageUrls.has(imageUrl)) {
                imageUrls.add(imageUrl);
                images.push(imageUrl);
              }
            }
          });
        }
      });
    }

    // Priority 2: Product images array
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img) => {
        const url = img?.url || img;
        if (url) {
          const imageUrl = getImageUrl(url);
          if (!imageUrls.has(imageUrl)) {
            imageUrls.add(imageUrl);
            images.push(imageUrl);
          }
        }
      });
    }

    // Priority 3: Single image fallback
    if (images.length === 0 && product.image) {
      const imageUrl = getImageUrl(product.image);
      if (!imageUrls.has(imageUrl)) {
        imageUrls.add(imageUrl);
        images.push(imageUrl);
      }
    }

    // Final fallback
    if (images.length === 0) {
      images.push("/placeholder.jpg");
    }

    return images;
  }, [product]);

  // Auto-rotate images on hover
  useEffect(() => {
    if (!isHovered || getAllProductImages.length <= 1) {
      setCurrentImageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % getAllProductImages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isHovered, getAllProductImages.length]);

  // 5. Price Calculation Logic
  const parsePrice = (value) => {
    if (value === null || value === undefined) return null;
    if (value === 0) return 0;
    const parsed = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(parsed) ? null : parsed;
  };

  const basePriceField = parsePrice(product.basePrice);
  const regularPriceField = parsePrice(product.regularPrice);
  const priceField = parsePrice(product.price);
  const salePriceField = parsePrice(product.salePrice);

  // Check for active flash sale
  const hasFlashSale = product.flashSale?.isActive === true;
  const flashSalePrice = hasFlashSale ? parsePrice(product.flashSale.flashSalePrice) : null;
  const flashSaleDiscountPercent = hasFlashSale ? product.flashSale.discountPercentage : 0;

  let hasSale = false;
  if (product.hasSale !== undefined && product.hasSale !== null) {
    hasSale = Boolean(product.hasSale);
  } else {
    // Auto-detect
    if (salePriceField !== null && salePriceField > 0) {
      if (regularPriceField && salePriceField < regularPriceField) hasSale = true;
      else if (priceField && salePriceField < priceField) hasSale = true;
      else if (basePriceField && regularPriceField && salePriceField < regularPriceField) hasSale = true;
    }
  }

  let originalPrice = null;
  let currentPrice = 0;

  if (basePriceField !== null && regularPriceField !== null) {
    if (hasSale && basePriceField < regularPriceField) {
      currentPrice = basePriceField;
      originalPrice = regularPriceField;
    } else {
      currentPrice = basePriceField;
    }
  } else if (salePriceField !== null && (priceField !== null || basePriceField !== null)) {
    if (hasSale && salePriceField) {
      currentPrice = salePriceField;
      if (priceField && priceField > salePriceField) originalPrice = priceField;
      else if (basePriceField && basePriceField > salePriceField) originalPrice = basePriceField;
      else if (regularPriceField && regularPriceField > salePriceField) originalPrice = regularPriceField;
    } else {
      currentPrice = priceField || basePriceField || regularPriceField || 0;
    }
  } else {
    if (hasSale && salePriceField) {
      currentPrice = salePriceField;
      originalPrice = regularPriceField || priceField || basePriceField || null;
    } else {
      currentPrice = basePriceField || regularPriceField || priceField || salePriceField || 0;
    }
  }

  if (currentPrice === null || currentPrice === undefined || isNaN(currentPrice)) {
    currentPrice = 0;
  }

  // If flash sale is active, use flash sale price and set original price
  let displayPrice = currentPrice;
  let showFlashSaleBadge = false;
  
  if (hasFlashSale && flashSalePrice !== null) {
    // Store original price before flash sale
    if (!originalPrice) {
      originalPrice = currentPrice;
    }
    displayPrice = flashSalePrice;
    showFlashSaleBadge = true;
  }

  const discountPercent = showFlashSaleBadge 
    ? flashSaleDiscountPercent 
    : (hasSale && originalPrice && currentPrice
        ? calculateDiscountPercentage(originalPrice, currentPrice)
        : 0);



  // Price Visibility Check
  const showPrice = !priceVisibilitySettings?.hidePricesForGuests || isAuthenticated;

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 border border-gray-100 hover:border-primary/20 h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Area */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50">
        
        {/* Wishlist Button */}
        <button
          onClick={handleAddToWishlist}
          disabled={isAddingToWishlist[product.id]}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white text-gray-400 hover:text-red-500 transition-all duration-200 transform hover:scale-110"
        >
          {isAddingToWishlist[product.id] ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Heart
              className={`h-5 w-5 ${wishlistItems[product.id] ? "fill-red-500 text-red-500" : ""}`}
            />
          )}
        </button>

        {/* Badges: Category & Discount */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
            {/* Category Badge */}
            {product.category && (
                <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-800 rounded-md shadow-sm border border-gray-100 uppercase tracking-wide w-fit">
                    {typeof product.category === 'object' ? product.category.name : product.category}
                </span>
            )}
            {/* Flash Sale Badge */}
            {showFlashSaleBadge && discountPercent > 0 && (
                <div className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-md shadow-lg w-fit animate-pulse flex items-center gap-1">
                    <span>⚡</span> {discountPercent}% OFF
                </div>
            )}
            {/* Regular Sale Badge (only if not flash sale) */}
            {!showFlashSaleBadge && hasSale && discountPercent > 0 && (
                <div className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-md shadow-sm w-fit animate-pulse">
                    {discountPercent}% OFF
                </div>
            )}
        </div>

        {/* Main Image with Hover Rotation */}
        <div className="relative w-full h-full">
            <Image
                src={getAllProductImages[currentImageIndex] || "/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>

        {/* Image Dots Indicator (if multiple) */}
        {getAllProductImages.length > 1 && isHovered && (
             <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
                {getAllProductImages.map((_, idx) => (
                    <div 
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? "w-4 bg-primary" : "w-1.5 bg-white/60"}`}
                    />
                ))}
             </div>
        )}
        
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Link>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-medium text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors" title={product.name}>
                {product.name}
            </h3>
        </Link>
        
        <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
             <div className="flex items-center text-yellow-500">
               
                <span className="ml-1 font-medium text-gray-700">
                    {product.avgRating && product.avgRating}
                </span>
             </div>
        </div>

        <div className="mt-auto pt-1 flex items-center justify-between border-t border-gray-50">
          <div className="flex flex-col">
             {showPrice ? (
                 <>
                    <div className="flex items-center gap-2">
                        <span className={`text-xl font-bold ${showFlashSaleBadge ? 'text-orange-600' : 'text-primary'}`}>
                            {formatCurrency(displayPrice)}
                        </span>
                        {(hasSale || showFlashSaleBadge) && originalPrice && (
                            <span className="text-sm text-gray-400 line-through decoration-gray-400">
                                {formatCurrency(originalPrice)}
                            </span>
                        )}
                    </div>
                 </>
             ) : (
                <Link href="/auth?redirect=products" className="text-sm font-medium text-primary hover:underline">
                    Login to view price
                </Link>
             )}
          </div>

          {/* Add to Cart / Quantity - Compact */}
          {/* {!inCart ? (
            <Button
              className="bg-primary hover:bg-primary/90 text-white rounded-full h-10 w-10 p-0 shadow-md hover:shadow-lg transition-all duration-300"
              onClick={handleAddToCart}
              disabled={!showPrice} // Disable if price is hidden (guest)
              title={!showPrice ? "Login to purchase" : "Add to Cart"}
            >
                {showAdded ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </Button>
          ) : (
             <div className="flex items-center bg-gray-50 rounded-full border border-gray-100 shadow-sm h-10">
                <button 
                    onClick={handleDecrement}
                    className="h-full px-3 text-gray-600 hover:text-primary transition-colors"
                >
                    <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-sm font-bold text-gray-900 w-4 text-center">{quantity}</span>
                <button 
                    onClick={handleIncrement}
                    className="h-full px-3 text-gray-600 hover:text-primary transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" />
                </button>
             </div>
          )} */}
        </div>
      </div>
    </div>
  );
};
