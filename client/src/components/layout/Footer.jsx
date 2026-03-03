"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Facebook, Instagram, Youtube, Handshake } from "lucide-react";
import { fetchApi } from "@/lib/utils";

const companyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Categories", href: "/categories" },
  { name: "Contact", href: "/contact" },
];

const PARTNER_PORTAL_URL = process.env.NEXT_PUBLIC_PARTNER_URL || 'http://localhost:5000';

const socialLinks = [
  { 
    name: "Instagram", 
    href: "https://www.instagram.com/official_djchallenger/", 
    icon: Instagram,
    color: "hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-400"
  },
  { 
    name: "Facebook", 
    href: "https://www.facebook.com/share/1DCsKYB5Uy/?mibextid=wwXIfr", 
    icon: Facebook,
    color: "hover:bg-blue-600"
  },
  { 
    name: "YouTube", 
    href: "https://youtube.com/@djchallengerindia?si=ZkkCpU1DEh48NBSe", 
    icon: Youtube,
    color: "hover:bg-red-600"
  },
];

export const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchApi("/public/categories");
        const fetchedCategories = response.data?.categories || [];
        // Limit to top 8 categories for the footer
        setCategories(fetchedCategories.slice(0, 8));
      } catch (error) {
        console.error("Error fetching categories for footer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer */}
        <div className="py-12 md:py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <Image
                src="/logo.png"
                alt="DJ-Challenger"
                width={120}
                height={50}
                className="h-20 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              India&apos;s leading manufacturer of professional audio equipment since 1998. Factory direct pricing, quality guaranteed.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 ${social.color}`}
                  title={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-5 text-white">
              Shop
            </h3>
            <ul className="space-y-3">
              {loading ? (
                // Loading skeleton for links
                <>
                  <li className="h-4 w-24 bg-white/10 rounded animate-pulse"></li>
                  <li className="h-4 w-20 bg-white/10 rounded animate-pulse"></li>
                  <li className="h-4 w-28 bg-white/10 rounded animate-pulse"></li>
                </>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-gray-400 hover:text-primary text-sm transition-colors block"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link
                    href="/products"
                    className="text-gray-400 hover:text-primary text-sm transition-colors"
                  >
                    All Products
                  </Link>
                </li>
              )}
              {/* Always show View All Categories link at the end if we have categories */}
              {categories.length > 0 && (
                <li>
                  <Link
                    href="/categories"
                    className="text-gray-400 hover:text-primary text-sm transition-colors block font-medium mt-2"
                  >
                    View All Categories
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-5 text-white">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shipping-policy" className="text-gray-400 hover:text-primary text-sm transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-gray-400 hover:text-primary text-sm transition-colors">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Partner Program */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-5 text-white">
              Partner Program
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/become-partner"
                  className="group relative inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  Become a Partner
                </Link>
              </li>
              <li>
                <a
                  href={PARTNER_PORTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary text-sm transition-colors flex items-center gap-1.5"
                >
                  <Handshake className="h-3.5 w-3.5" />
                  Partner Login
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-5 text-white">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <a href="mailto:Info@djchallenger.in" className="text-gray-400 hover:text-white text-sm transition-colors break-all">
                  Info@djchallenger.in
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-gray-400 text-sm space-y-2">
                  <div>
                    <span className="font-medium text-white block">Head Office:</span>
                    Rome Italy - 00121
                  </div>
                  <div>
                    <span className="font-medium text-white block">Regional Office:</span>
                    Delhi NCR - Uttar Pradesh - 201102
                  </div>
                </div>
              </li>
            </ul>

            {/* Follow Us */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-xs text-gray-500 mb-3">Follow us on social media</p>
              <div className="flex gap-2">
                {socialLinks.map((social) => (
                  <a 
                    key={social.name}
                    href={social.href} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary text-xs transition-colors"
                  >
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} DJ-Challenger. All rights reserved.
            </p>
          </div>
          
          {/* Payment Icons */}
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-xs">We accept:</span>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-white/10 rounded text-xs text-gray-400">UPI</div>
              <div className="px-3 py-1 bg-white/10 rounded text-xs text-gray-400">VISA</div>
              <div className="px-3 py-1 bg-white/10 rounded text-xs text-gray-400">MC</div>
              <div className="px-3 py-1 bg-white/10 rounded text-xs text-gray-400">COD</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
