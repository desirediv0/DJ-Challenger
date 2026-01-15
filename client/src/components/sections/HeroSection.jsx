"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchApi } from "@/lib/utils";

/* ------------------ Fallback Slides ------------------ */
const fallbackSlides = [
  {
    label: "Factory Direct Audio Brand",
    headline: "Professional Audio Equipment",
    subheadline: "Built to Perform",
    description:
      "Premium DJ speakers and PA systems trusted by 50,000+ professionals",
    desktopImage: "/hero-slide-1.png",
    mobileImage: "/hero-slide-1.png",
    gradient: "from-black/70 via-black/50 to-transparent",
    link: "/products",
  },
  {
    label: "Best-in-Class Quality",
    headline: "Powerful Sound Systems",
    subheadline: "For Every Stage",
    description:
      "From intimate venues to massive events - we have you covered",
    desktopImage: "/hero-slide-2.png",
    mobileImage: "/hero-slide-2.png",
    gradient: "from-black/70 via-black/50 to-transparent",
    link: "/products",
  },
];

export default function HeroSection() {
  const [slides, setSlides] = useState(fallbackSlides);
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  /* ------------------ Detect Mobile ------------------ */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* ------------------ Fetch Banners ------------------ */
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetchApi("/public/banners");

        if (
          res?.success &&
          Array.isArray(res.data?.banners) &&
          res.data.banners.length > 0
        ) {
          const apiSlides = res.data.banners.map((banner) => ({
            label: banner.label || "Featured Collection",
            headline: banner.title || "",
            subheadline: banner.subtitle || "",
            description: banner.description || "",
            desktopImage: banner.desktopImage,
            mobileImage: banner.mobileImage || banner.desktopImage,
            gradient: "from-black/70 via-black/50 to-transparent",
            link: banner.link || "/products",
          }));

          setSlides(apiSlides);
        }
      } catch (err) {
        console.error("Banner API error:", err);
        setSlides(fallbackSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  /* ------------------ Slider Logic ------------------ */
  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  if (loading) {
    return (
      <section className="h-screen flex items-center justify-center bg-black ">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <section
      className="relative h-[80vh] w-full bg-black overflow-hidden"
    >
      {/* ------------------ Slides ------------------ */}
      {slides.map((slide, index) => {
        const imageSrc = isMobile
          ? slide.mobileImage
          : slide.desktopImage;

        return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* ✅ Next.js Image */}
            <Image
              src={imageSrc}
              alt={slide.headline || "Hero banner"}
              fill
              className="object-cover md:object-fill transition-transform duration-700"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            />

            {/* Overlays */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </div>
        );
      })}

      {/* ------------------ Content ------------------ */}
      <div className="relative z-20 h-full flex items-center">
        <div className="w-full px-6 md:px-16 lg:px-24">
          <div className="max-w-4xl">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm mb-6">
              {slides[current].label}
            </span>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-2">
              {slides[current].headline}
            </h1>

            <h2 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              {slides[current].subheadline}
            </h2>

            <p className="text-lg text-white/70 max-w-xl mb-10">
              {slides[current].description}
            </p>

            <div className="flex gap-4 flex-col sm:flex-row">
              <Link href={slides[current].link}>
                <Button size="lg" className="h-14 px-10 rounded-full">
                  Shop Now
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-10 rounded-full"
                >
                  Explore Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------ Navigation ------------------ */}
      <div className="hidden md:flex absolute z-30 right-10 bottom-1/2 translate-y-1/2 flex-col gap-3">
        <button onClick={prevSlide} className="nav-btn">
          <ChevronLeft />
        </button>
        <button onClick={nextSlide} className="nav-btn">
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
