import "./globals.css";
import { Navbar } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";

export const metadata = {
  title: "DJ-Challenger | Professional P.A Systems Manufacturer",
  description: "Leading manufacturer, exporter & importer of professional P.A systems, DJ speakers, amplifiers, driver units, and audio equipment. Trusted by professionals worldwide.",
  keywords: "PA system, DJ speakers, amplifiers, driver units, megaphones, professional audio, sound system, India manufacturer",
  authors: [{ name: "DJ-Challenger" }],
  openGraph: {
    title: "DJ-Challenger | Professional P.A Systems Manufacturer",
    description: "Leading manufacturer, exporter & importer of professional P.A systems. DJ speakers, amplifiers, driver units and more.",
    type: "website",
    locale: "en_IN",
    siteName: "DJ-Challenger",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />

          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
