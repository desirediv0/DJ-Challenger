import Link from "next/link";
import Image from "next/image";
import { Mail,  MapPin, Facebook, Instagram, Youtube } from "lucide-react";

const shopLinks = [
  { name: "All Products", href: "/products" },
  { name: "DJ Speakers", href: "/products?category=dj-speakers" },
  { name: "Amplifiers", href: "/products?category=amplifiers" },
  { name: "PA Systems", href: "/products?category=pa-series" },
  { name: "Trolley Speakers", href: "/products?category=trolley-speakers" },
];

const companyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Categories", href: "/categories" },
  { name: "Contact", href: "/contact" },
];

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
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer */}
        <div className="py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <Image
                src="/logo.png"
                alt="DJ-Challenger"
                width={120}
                height={50}
                className="h-12 w-auto brightness-0 invert"
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
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
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

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-5 text-white">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <a href="mailto:DjChallengerIndia@gmail.com" className="text-gray-400 hover:text-white text-sm transition-colors break-all">
                  DjChallengerIndia@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  Industrial Area, Delhi NCR
                </span>
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
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} DJ-Challenger. All rights reserved.
          </p>
          
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
