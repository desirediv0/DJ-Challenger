"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useState, useEffect, useRef, forwardRef } from "react";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  Heart,
  ChevronDown,
  ChevronRight,
  Phone,
  Headphones,
  Volume2,
  Zap,
  Package,
  LogOut,
  MapPin,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi, cn } from "@/lib/utils";
import { ClientOnly } from "@/components/client-only";
import Image from "next/image";
import { toast, Toaster } from "sonner";

// Input component
const Input = forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, getCartItemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const placeholders = [
    "Search for speakers...",
    "Search for amplifiers...",
    "Search for PA systems...",
    "Search for driver units..."
  ];
  
  const searchInputRef = useRef(null);
  const navbarRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Track scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Rotate placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchApi("/public/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <>
      <header ref={navbarRef} className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "shadow-lg bg-white/98 backdrop-blur-md" : "bg-white"}`}>
        <Toaster position="top-center" richColors />
        
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-primary to-orange-500 text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-9 text-xs md:text-sm">
             
              <div className="flex items-center gap-3 mx-auto md:mx-0">
                <div className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="h-4 w-4" />
                  Free Shipping on Orders ₹999+
                </div>
                <span className="hidden sm:inline text-white/50">|</span>
                <Link href="/products?flashSale=true" className="hidden sm:flex items-center gap-1.5 font-bold hover:text-yellow-200 transition-colors group">
                  <Zap className="h-4 w-4 text-yellow-300 animate-pulse group-hover:scale-110 transition-transform" />
                  <span className="text-yellow-200">Flash Sale Live!</span>
                </Link>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <Link href="/shipping-policy" className="hover:text-white/80 transition-colors">Shipping</Link>
                <Link href="/contact" className="hover:text-white/80 transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 md:h-[72px]">
              
              {/* Logo */}
              <Link href="/" className="flex-shrink-0">
                <Image src="/logo.png" alt="DJ-Challenger" width={140} height={50} className="h-10 md:h-12 w-auto" priority />
              </Link>

              {/* Desktop Search Bar */}
              <div className="hidden lg:flex flex-1 max-w-xl mx-8">
                <form onSubmit={handleSearch} className="w-full">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder={placeholders[placeholderIndex]}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery("")} className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-colors">
                      Search
                    </button>
                  </div>
                </form>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                <Link href="/products" className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === "/products" ? "text-primary bg-primary/5" : "text-gray-700 hover:text-primary hover:bg-gray-50"}`}>
                  Products
                </Link>

                {/* Categories Dropdown */}
                <div className="relative" onMouseEnter={() => setActiveDropdown("categories")} onMouseLeave={() => setActiveDropdown(null)}>
                  <button className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeDropdown === "categories" ? "text-primary bg-primary/5" : "text-gray-700 hover:text-primary hover:bg-gray-50"}`}>
                    Categories <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === "categories" ? "rotate-180" : ""}`} />
                  </button>
                  
                  {activeDropdown === "categories" && (
                    <div className="absolute left-0 top-full pt-2">
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-200">
                        {categories.slice(0, 8).map((cat) => (
                          <Link key={cat.id} href={`/category/${cat.slug}`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors">
                            <Zap className="h-4 w-4 text-primary/50" />
                            {cat.name}
                          </Link>
                        ))}
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <Link href="/categories" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
                            View All <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/about" className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === "/about" ? "text-primary bg-primary/5" : "text-gray-700 hover:text-primary hover:bg-gray-50"}`}>
                  About
                </Link>
                <Link href="/contact" className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === "/contact" ? "text-primary bg-primary/5" : "text-gray-700 hover:text-primary hover:bg-gray-50"}`}>
                  Contact
                </Link>
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-1">
                {/* Mobile Search */}
                <button onClick={() => setIsSearchOpen(true)} className="lg:hidden p-2.5 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors">
                  <Search className="h-5 w-5" />
                </button>

                {/* Wishlist */}
                <Link href="/wishlist" className="hidden md:flex p-2.5 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors relative">
                  <Heart className="h-5 w-5" />
                </Link>

                {/* Cart */}
                <ClientOnly>
                  <Link href="/cart" className="p-2.5 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors relative">
                    <ShoppingCart className="h-5 w-5" />
                    {getCartItemCount() > 0 && (
                      <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {getCartItemCount()}
                      </span>
                    )}
                  </Link>
                </ClientOnly>

                {/* Account Dropdown */}
                <div className="relative hidden md:block" onMouseEnter={() => setActiveDropdown("account")} onMouseLeave={() => setActiveDropdown(null)}>
                  <ClientOnly>
                    <button className={`flex items-center gap-1 p-2.5 rounded-lg transition-colors ${activeDropdown === "account" ? "text-primary bg-primary/5" : "text-gray-600 hover:text-primary hover:bg-gray-50"}`}>
                      {isAuthenticated ? (
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      ) : (
                        <>
                          <User className="h-5 w-5" />
                          <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === "account" ? "rotate-180" : ""}`} />
                        </>
                      )}
                    </button>

                    {activeDropdown === "account" && (
                      <div className="absolute right-0 top-full pt-2">
                        <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-72 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                          {isAuthenticated ? (
                            <>
                              {/* User Info */}
                              <div className="bg-gradient-to-br from-primary/5 to-orange-50 p-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{user?.name || "User"}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Menu Items */}
                              <div className="py-2">
                                <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors" onClick={() => setActiveDropdown(null)}>
                                  <User className="h-4 w-4 text-gray-400" /> My Profile
                                </Link>
                                <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors" onClick={() => setActiveDropdown(null)}>
                                  <Package className="h-4 w-4 text-gray-400" /> My Orders
                                </Link>
                                <Link href="/account/addresses" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors" onClick={() => setActiveDropdown(null)}>
                                  <MapPin className="h-4 w-4 text-gray-400" /> Addresses
                                </Link>
                                <Link href="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors" onClick={() => setActiveDropdown(null)}>
                                  <Heart className="h-4 w-4 text-gray-400" /> Wishlist
                                </Link>
                              </div>
                              
                              {/* Logout */}
                              <div className="border-t border-gray-100 py-2">
                                <button onClick={() => { handleLogout(); setActiveDropdown(null); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                  <LogOut className="h-4 w-4" /> Sign Out
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="p-4">
                              <div className="text-center mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <User className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Welcome!</h3>
                                <p className="text-sm text-gray-500">Sign in to access your account</p>
                              </div>
                              <div className="space-y-2">
                                <Link href="/auth" className="block" onClick={() => setActiveDropdown(null)}>
                                  <Button className="w-full bg-primary hover:bg-primary/90 h-11">Sign In</Button>
                                </Link>
                                <Link href="/auth?tab=register" className="block" onClick={() => setActiveDropdown(null)}>
                                  <Button variant="outline" className="w-full h-11">Create Account</Button>
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </ClientOnly>
                </div>

                {/* Mobile Menu */}
                <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setIsSearchOpen(false)}>
          <div className="bg-white p-4 animate-in slide-in-from-top duration-200" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={placeholders[placeholderIndex]}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                autoComplete="off"
              />
              <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <Image src="/logo.png" alt="DJ-Challenger" width={100} height={35} className="h-8 w-auto" />
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Section */}
            <ClientOnly>
              <div className="p-4 bg-gradient-to-br from-primary/5 to-orange-50 border-b border-gray-100">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/auth" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/90">Sign In</Button>
                    </Link>
                    <Link href="/auth?tab=register" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Register</Button>
                    </Link>
                  </div>
                )}
              </div>
            </ClientOnly>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 space-y-1">
                <Link href="/products" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <Volume2 className="h-5 w-5 text-gray-400" /> All Products
                </Link>
                <Link href="/categories" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <Headphones className="h-5 w-5 text-gray-400" /> Categories
                </Link>
                <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <Heart className="h-5 w-5 text-gray-400" /> Wishlist
                </Link>
                <Link href="/cart" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <ShoppingCart className="h-5 w-5 text-gray-400" /> Cart
                  <ClientOnly>
                    {getCartItemCount() > 0 && (
                      <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{getCartItemCount()}</span>
                    )}
                  </ClientOnly>
                </Link>
              </div>

              {/* Categories */}
              <div className="mt-4 pt-4 border-t border-gray-100 px-4">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                <div className="space-y-1">
                  {categories.slice(0, 6).map((cat) => (
                    <Link key={cat.id} href={`/category/${cat.slug}`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>
                      <Zap className="h-4 w-4 text-primary/40" /> {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account Links */}
              <ClientOnly>
                {isAuthenticated && (
                  <div className="mt-4 pt-4 border-t border-gray-100 px-4">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Account</p>
                    <div className="space-y-1">
                      <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>
                        <User className="h-4 w-4 text-gray-400" /> Profile
                      </Link>
                      <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>
                        <Package className="h-4 w-4 text-gray-400" /> My Orders
                      </Link>
                      <Link href="/account/addresses" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>
                        <MapPin className="h-4 w-4 text-gray-400" /> Addresses
                      </Link>
                      <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </ClientOnly>

              {/* Footer Links */}
              <div className="mt-4 pt-4 border-t border-gray-100 px-4">
                <div className="space-y-1">
                  <Link href="/about" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>About Us</Link>
                  <Link href="/contact" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                  <Link href="/shipping-policy" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>Shipping Policy</Link>
                </div>
              </div>
            </div>

           
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-pb">
        <div className="grid grid-cols-4">
          <Link href="/" className={`flex flex-col items-center py-2 ${pathname === "/" ? "text-primary" : "text-gray-500"}`}>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] mt-0.5 font-medium">Home</span>
          </Link>
          <Link href="/categories" className={`flex flex-col items-center py-2 ${pathname === "/categories" ? "text-primary" : "text-gray-500"}`}>
            <Headphones className="h-5 w-5" />
            <span className="text-[10px] mt-0.5 font-medium">Categories</span>
          </Link>
          <Link href="/cart" className={`flex flex-col items-center py-2 relative ${pathname === "/cart" ? "text-primary" : "text-gray-500"}`}>
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              <ClientOnly>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {getCartItemCount()}
                  </span>
                )}
              </ClientOnly>
            </div>
            <span className="text-[10px] mt-0.5 font-medium">Cart</span>
          </Link>
          <Link href={isAuthenticated ? "/account" : "/auth"} className={`flex flex-col items-center py-2 ${pathname.includes("/account") || pathname === "/auth" ? "text-primary" : "text-gray-500"}`}>
            <User className="h-5 w-5" />
            <span className="text-[10px] mt-0.5 font-medium">Account</span>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Navbar;
