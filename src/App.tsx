import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, Shield, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { cn } from './lib/utils';

// Pages - to be implemented soon
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackOrder from './pages/TrackOrder';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import { About, Shipping, Returns } from './pages/StaticPages';

// Pages

const Header = () => {
  const { totalItems } = useCart();
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT US', path: '/about' },
    { name: 'NEW ARRIVALS', path: '/category/New%20Arrivals' },
    { name: 'BEST SELLERS', path: '/category/Best%20Sellers' },
    { name: 'SAREES', path: '/category/Sarees' },
    { name: 'KURTIS AND SUIT SETS', path: '/category/Kurti%20Sets' },
    { name: 'SKIRTS & DRESSES', path: '/category/Skirts%20&%20Dresses' },
    { name: 'BLOUSES', path: '/category/Blouses' },
    { name: 'DEALS', path: '/category/Deals' },
    { name: 'TRACK ORDER', path: '/track-order' },
  ];

  return (
    <header className="z-50 bg-[#FFFCF5]">
      {/* Top purple bar */}
      <div className="h-2 w-full bg-brand-plum" />
      
      <div className="max-w-[1400px] mx-auto px-6 py-6 border-b border-gray-100/50">
        <div className="flex items-center justify-between">
          {/* Mobile menu trigger */}
          <div className="lg:hidden flex-1">
            <button className="p-2" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="hidden lg:flex flex-1 items-center space-x-6">
            <Link to="/track-order" className="text-[9px] font-bold tracking-[0.2em] text-gray-500 hover:text-brand-plum transition-colors uppercase border-b border-gray-200 pb-0.5">
              Track Order Status
            </Link>
          </div>

          {/* Logo Center */}
          <div className="flex-1 flex justify-center">
            <Link to="/" className="flex flex-col items-center">
              <h1 className="text-4xl md:text-5xl font-serif tracking-[0.2em] text-brand-plum uppercase">Thenmozhi</h1>
              <div className="flex items-center w-full mt-1">
                <div className="h-[1px] bg-brand-plum/40 flex-grow" />
                <span className="px-4 text-[10px] tracking-[0.4em] font-light text-brand-plum uppercase">Designs</span>
                <div className="h-[1px] bg-brand-plum/40 flex-grow" />
              </div>
            </Link>
          </div>

          {/* Icons Right */}
          <div className="flex-1 flex items-center justify-end space-x-4 md:space-x-6">
            <Link to="/admin" className="hover:text-brand-plum transition-colors">
              <User size={22} strokeWidth={1.5} />
            </Link>
            <button className="hover:text-brand-plum transition-colors hidden sm:block">
              <Search size={22} strokeWidth={1.5} />
            </button>
            <Link to="/cart" className="group relative flex items-center gap-2 hover:text-brand-plum transition-colors">
              <div className="relative">
                <ShoppingBag size={22} strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-plum text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#FFFCF5]">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex flex-col items-center mt-12 space-y-4">
          <div className="flex items-center justify-center gap-2 xl:gap-8 flex-wrap">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "text-[10px] font-bold tracking-[0.1em] px-2 py-1 transition-all uppercase whitespace-nowrap",
                  location.pathname === link.path 
                    ? "text-brand-plum border-b border-brand-plum" 
                    : "text-gray-600 hover:text-brand-plum"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <Link to="/instagram" className="text-[10px] font-bold tracking-[0.2em] text-gray-600 hover:text-brand-plum uppercase pt-2">
            Instagram Feed of the Day
          </Link>
        </nav>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-brand-champagne/30 py-8 px-4 flex flex-col space-y-6 shadow-xl"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium tracking-widest text-center py-2"
              >
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const ProtectedAdmin = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <div className="p-20 text-center">Unauthorized. Only registered administrators can access this section.</div>;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/category/:name" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/about" element={<About />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/returns" element={<Returns />} />
                
                {/* Admin Routes - logic handled internally in components */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/products" element={<AdminProducts />} />
              </Routes>
            </main>
            <footer className="bg-brand-plum text-white py-20 px-4">
              <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-16 lg:gap-24">
                <div className="space-y-8">
                  <h4 className="text-[11px] tracking-[0.2em] font-black uppercase">QUICK LINKS</h4>
                  <ul className="text-xs space-y-4 text-white/70 font-light tracking-wide">
                    <li><Link to="/returns" className="hover:text-white transition-colors">Return and Store Credit Request</Link></li>
                    <li><Link to="/track-order" className="hover:text-white transition-colors">Order Status</Link></li>
                    <li><button className="hover:text-white transition-colors">My Account</button></li>
                    <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
                    <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
                    <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                  </ul>
                </div>

                <div className="space-y-8">
                  <h4 className="text-[11px] tracking-[0.2em] font-black uppercase">CUSTOMER SERVICE</h4>
                  <ul className="text-xs space-y-4 text-white/70 font-light tracking-wide">
                    <li><Link to="/stitching" className="hover:text-white transition-colors">Stitching Policy</Link></li>
                    <li><Link to="/blouse-stitching" className="hover:text-white transition-colors">One Day Blouse Stitching</Link></li>
                    <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
                    <li><Link to="/returns" className="hover:text-white transition-colors">Return & Exchange Policy</Link></li>
                    <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                    <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                    <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                  </ul>
                </div>

                <div className="space-y-12 lg:col-span-2">
                  <div className="space-y-6">
                    <h4 className="text-[11px] tracking-[0.2em] font-black uppercase">ABOUT THENMOZHI DESIGNS</h4>
                    <p className="text-xs text-white/70 font-light leading-relaxed tracking-wide max-w-md">
                      Thenmozhi Designs is an online platform celebrating intricate handloom cotton collections. Each piece is carefully handpicked and curated in a variety of patterns, colors, and fabrics.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-4">
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black tracking-widest uppercase border-b border-white/20 pb-2 inline-block">Customer Care</h5>
                      <div className="text-[11px] font-light text-white/70 space-y-1">
                        <p>Mon - Sat 9AM - 8PM</p>
                        <p>Sunday 10AM - 8PM</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black tracking-widest uppercase border-b border-white/20 pb-2 inline-block">Location:</h5>
                        <p className="text-[11px] font-light text-white/70 leading-relaxed uppercase">
                          Annapoorani Building, 2nd Floor, Plot No. 4 & 5, Sakthi Nagar New Street, Parvathi Avenue, Porur, Chennai - 600116
                        </p>
                      </div>
                      <button className="bg-white text-brand-plum px-8 py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-colors rounded-sm shadow-xl">
                        GET DIRECTIONS
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Icons & Copyright */}
              <div className="max-w-[1400px] mx-auto mt-24 pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center space-x-12">
                   <a href="#" className="text-white/60 hover:text-white transition-colors">
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                   </a>
                   <a href="#" className="text-white/60 hover:text-white transition-colors">
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.981 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                   </a>
                   <a href="#" className="text-white/60 hover:text-white transition-colors">
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.261 7.929-7.261 4.162 0 7.397 2.966 7.397 6.93 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.034-1.002 2.324-1.492 3.121 1.063.328 2.186.505 3.352.505 6.621 0 11.988-5.367 11.988-11.987C23.987 5.367 18.621 0 12.017 0z"/></svg>
                   </a>
                   <a href="#" className="text-white/60 hover:text-white transition-colors">
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                   </a>
                </div>
                <p className="text-[10px] text-white/30 tracking-[0.2em] font-medium">
                   &copy; {new Date().getFullYear()} THENMOZHI DESIGNS • ALL RIGHTS RESERVED
                </p>
              </div>
            </footer>
            
            {/* WhatsApp Float */}
            <a 
              href="https://wa.me/919488424266" 
              target="_blank" 
              rel="noreferrer"
              className="fixed bottom-8 right-8 z-[100] bg-[#4CAF50] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
