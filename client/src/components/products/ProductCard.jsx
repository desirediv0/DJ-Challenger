"use client";

import Link from "next/link";
import { Heart, Loader2, ShoppingBag } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { fetchApi, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
  const { addToCart } = useCart();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
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

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigating to product page
    e.stopPropagation();

    if (!showPrice) {
        toast.error("Please login to purchase items");
        return;
    }

    setIsAddingToCart(true);
    try {
        // Use the first variant ID if available, otherwise assume product structure handles it or fails gracefully
        // The CartContext expects productVariantId
        const variantId = product.variants?.[0]?.id;
        
        if (!variantId) {
            // Fallback or error if no variants structure matches
             toast.error("Select options on product page");
             router.push(`/products/${product.slug}`);
             return;
        }

        await addToCart(variantId, 1);
        toast.success("Added to bag");
    } catch (error) {
        console.error("Add to cart error:", error);
        // Toast handled in context usually, but good to be safe
    } finally {
        setIsAddingToCart(false);
    }
  };

  return (
    <div
      className="group relative bg-white rounded-md overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-200 h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-[4/4] overflow-hidden bg-gray-100">
        
        {/* Wishlist Button */}
        <button
          onClick={handleAddToWishlist}
          disabled={isAddingToWishlist[product.id]}
          className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/90 shadow-sm hover:bg-white text-gray-500 hover:text-red-500 transition-colors"
        >
          {isAddingToWishlist[product.id] ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={`h-4 w-4 ${wishlistItems[product.id] ? "fill-red-500 text-red-500" : ""}`} />
          )}
        </button>

        {/* Discount Badge */}
        {(showFlashSaleBadge || hasSale) && discountPercent > 0 && (
          <div className={`absolute top-2 left-2 z-20 px-2 py-0.5 text-white text-xs font-bold rounded ${showFlashSaleBadge ? 'bg-orange-500' : 'bg-red-500'}`}>
            {discountPercent}% OFF
          </div>
        )}

        {/* Image */}
        <Image
          src={getAllProductImages[currentImageIndex] || "/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500"
          sizes="(max-width: 640px) 30vw, (max-width: 1024px) 25vw, 15vw"
        />

        {/* Image dots */}
        {getAllProductImages.length > 1 && isHovered && (
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1 z-20">
            {getAllProductImages.map((_, idx) => (
              <div key={idx} className={`h-1 rounded-full transition-all ${idx === currentImageIndex ? "w-3 bg-white" : "w-1 bg-white/50"}`} />
            ))}
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-2.5 flex flex-col flex-grow">
        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 hover:text-primary transition-colors mb-1.5">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.avgRating && (
          <div className="flex items-center gap-0.5 text-xs text-gray-500 mb-1.5">
            <span className="text-yellow-500">★</span>
            <span>{product.avgRating}</span>
          </div>
        )}

        {/* Price + Add Button Row */}
        <div className="mt-auto flex items-center justify-between gap-1.5">
          {/* Price */}
          <div className="min-w-0">
            {showPrice ? (
              <>
                <div className={`text-sm font-bold ${showFlashSaleBadge ? 'text-orange-600' : 'text-gray-900'}`}>
                  {formatCurrency(displayPrice)}
                </div>
                {(hasSale || showFlashSaleBadge) && originalPrice && (
                  <div className="text-xs text-gray-400 line-through">
                    {formatCurrency(originalPrice)}
                  </div>
                )}
              </>
            ) : (
              <Link href="/auth?redirect=products" className="text-xs text-primary hover:underline">
                Login
              </Link>
            )}
          </div>

          {/* Add Button */}
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!showPrice || isAddingToCart}
            className="h-8 px-2.5 text-xs rounded-md flex-shrink-0"
          >
            {isAddingToCart ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                <span className="ml-1 hidden xs:inline">Add</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
