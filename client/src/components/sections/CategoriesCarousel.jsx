"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "@/lib/utils";
import { Zap } from "lucide-react";

const getImageUrl = (image) => {
  if (!image) return "/placeholder.jpg";
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

export default function CategoriesCarousel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchApi("/public/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-6 max-w-7xl mx-auto overflow-hidden">
        <div className="flex gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-24 h-28 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) return null;

  const CategoryItem = ({ category, idx }) => (
    <Link
      key={`${category.id}-${idx}`}
      href={`/category/${category.slug}`}
      className="flex-shrink-0 flex flex-col items-center group/item px-2"
    >
      <div className="relative w-20 h-20 lg:w-28 lg:h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 group-hover/item:border-primary group-hover/item:shadow-lg transition-all duration-300">
        {category.image ? (
          <Image
            src={getImageUrl(category.image)}
            alt={category.name}
            fill
            className="object-contain transition-transform group-hover/item:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Zap className="w-8 h-8 text-primary/40" />
          </div>
        )}
      </div>
      <span className="mt-2 text-xs lg:text-sm text-center font-medium text-gray-700 group-hover/item:text-primary transition-colors line-clamp-2 max-w-[80px] lg:max-w-[100px]">
        {category.name}
      </span>
    </Link>
  );

  return (
    <div className="w-full py-6 relative group max-w-7xl mx-auto overflow-hidden">
      
      {/* CSS Animation for smooth endless marquee */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes customMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-smooth {
          animation: customMarquee 25s linear infinite;
        }
        .animate-marquee-smooth:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* Fade Gradients for visual appealing edges */}
      <div className="absolute top-0 left-0 w-12 lg:w-24 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-12 lg:w-24 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Marquee Track Container */}
      <div className="flex w-max animate-marquee-smooth">
        
        {/* First list of categories */}
        <div className="flex justify-around">
          {categories.map((category, idx) => <CategoryItem key={`first-${category.id}-${idx}`} category={category} idx={idx} />)}
        </div>
        
        {/* Exact same list duplicated for seamless looping */}
        <div className="flex justify-around">
          {categories.map((category, idx) => <CategoryItem key={`second-${category.id}-${idx}`} category={category} idx={idx} />)}
        </div>

      </div>
    </div>
  );
}
