import { ShopByCategory } from "@/components/sections/ShopByCategory";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { BestSellers } from "@/components/sections/BestSellers";
import { TrendingProducts } from "@/components/sections/TrendingProducts";
import { NewArrivals } from "@/components/sections/NewArrivals";
import { WhyBuySection } from "@/components/sections/WhyBuySection";
import { UseCaseShopping } from "@/components/sections/UseCaseShopping";
import { TrustSection } from "@/components/sections/TrustSection";
import { SocialMediaSection } from "@/components/sections/SocialMediaSection";
import CategoriesCarousel from "@/components/sections/CategoriesCarousel";
import HeroSection from "@/components/sections/HeroSection";
import { FlashSaleSection } from "@/components/sections/FlashSaleSection";

export default function Home() {
  return (
    <>
      <main>
        <CategoriesCarousel />
        <HeroSection />
        <ShopByCategory />
        <FeaturedProducts />
        <FlashSaleSection />
        <BestSellers />
        <TrendingProducts />
        <NewArrivals />
        <WhyBuySection />
        <UseCaseShopping />
        <SocialMediaSection />
        <TrustSection />
      </main>
    </>
  );
}
