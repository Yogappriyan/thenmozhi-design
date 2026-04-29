import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import { Product } from '../types';
import { cn } from '../lib/utils';

const HERO_SLIDES = [
  {
    image: "https://i.postimg.cc/76Cs8KYN/Td-desktop-banner-921314f9-56c8-44cb-9ca2-d69c35d3a9d3.webp",
    title: "The Handloom Narrative",
    subtitle: "NEW ARRIVALS",
    cta: "EXPLORE COLLECTION",
    path: "/category/New%20Arrivals"
  },
  {
    image: "https://i.postimg.cc/4yQprct6/Td-desktop-banner-1.webp",
    title: "Timeless Drape Elegance",
    subtitle: "SAREE EDIT",
    cta: "SHOP SAREES",
    path: "/category/Sarees"
  }
];

const CATEGORIES = [
  { name: 'NEW ARRIVALS', img: 'https://i.postimg.cc/vTCdw1sY/352A7672.webp', path: '/category/New%20Arrivals' },
  { name: 'BEST SELLERS', img: 'https://i.postimg.cc/Y9wcLP8M/color-Dark-Green.webp', path: '/category/Best%20Sellers' },
  { name: 'SAREES', img: 'https://i.postimg.cc/QC9RmXTs/IMG-9545.webp', path: '/category/Sarees' },
  { name: 'KURTI SETS', img: 'https://i.postimg.cc/T2DGwrc9/Mint-Blossomwithblushpinkfloralblockprinted-Cotton-Salwar-Suit-Setwith-Kota-Dupatta-9.webp', path: '/category/Kurti%20Sets' },
  { name: 'SKIRTS & DRESSES', img: 'https://i.postimg.cc/hPY9rRm1/ASWN4249-1.webp', path: '/category/Skirts%20&%20Dresses' },
  { name: 'BLOUSES', img: 'https://i.postimg.cc/28t4wNWx/DSC08480.webp', path: '/category/Blouses' },
  { name: 'DEALS', img: 'https://i.postimg.cc/sDLpcCWc/KRAN9807.webp', path: '/category/Deals' },
];

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block overflow-hidden bg-gray-50 aspect-[3/4] relative">
        <img 
          src={product.images[0].replace('w=2000', 'w=600').replace('w=1200', 'w=600')} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-4 left-4 bg-brand-plum text-white text-[9px] px-3 py-1 font-black tracking-widest uppercase">
            SALE
          </div>
        )}
        <div className="absolute inset-0 bg-brand-plum/0 group-hover:bg-brand-plum/5 transition-colors" />
      </Link>
      <div className="mt-6 text-center space-y-2 px-2">
        <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-brand-plum/50">{product.category}</h3>
        <h2 className="text-[13px] font-medium tracking-wide h-10 line-clamp-2 text-brand-charcoal uppercase leading-relaxed">{product.name}</h2>
        <div className="flex items-center justify-center space-x-3 pt-1">
          <span className="text-sm font-serif text-brand-plum font-bold">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-[11px] text-gray-300 line-through">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(
          collection(db, COLLECTIONS.PRODUCTS),
          orderBy('createdAt', 'desc'),
          limit(8)
        );
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setFeaturedProducts(products);
      } catch (err) {
        console.error(err);
        handleFirestoreError(err, OperationType.LIST, COLLECTIONS.PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative h-[90vh] overflow-hidden bg-[#FFFCF5]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-brand-charcoal/10 z-10" />
            <img 
              src={HERO_SLIDES[currentSlide].image} 
              alt="Hero"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white text-[11px] tracking-[0.5em] mb-8 font-black uppercase drop-shadow-sm"
          >
            {HERO_SLIDES[currentSlide].subtitle}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white text-5xl md:text-7xl lg:text-9xl font-serif mb-16 leading-tight drop-shadow-xl"
          >
            {HERO_SLIDES[currentSlide].title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link 
              to={HERO_SLIDES[currentSlide].path}
              className="group relative inline-flex items-center gap-4 bg-white text-brand-plum px-12 py-5 text-[11px] tracking-[0.3em] font-black uppercase hover:bg-brand-plum hover:text-white transition-all duration-500 rounded-sm shadow-2xl"
            >
              {HERO_SLIDES[currentSlide].cta}
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Custom Progress Indicators */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center space-x-12 z-20">
           {HERO_SLIDES.map((_, i) => (
             <button 
               key={i}
               onClick={() => setCurrentSlide(i)}
               className="group p-4 flex flex-col items-center gap-3"
             >
                <span className={cn(
                  "text-[10px] font-black tracking-widest transition-colors",
                  currentSlide === i ? "text-white" : "text-white/40"
                )}>0{i + 1}</span>
                <div className={cn(
                  "h-[2px] transition-all duration-1000",
                  currentSlide === i ? "w-16 bg-white" : "w-8 bg-white/20"
                )} />
             </button>
           ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-[1600px] mx-auto px-6">
        <div className="text-center space-y-6 mb-24">
          <span className="text-[11px] tracking-[0.5em] text-brand-plum/40 font-black uppercase">EXPLORE COLLECTIONS</span>
          <h2 className="text-5xl md:text-6xl font-serif text-brand-plum">Curated Departments</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative aspect-[4/5] overflow-hidden bg-brand-charcoal"
            >
              <Link to={cat.path}>
                <img 
                  src={cat.img} 
                  alt={cat.name}
                  className="w-full h-full object-cover opacity-80 transition-all duration-1000 group-hover:scale-110 group-hover:opacity-40"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-brand-plum/0 group-hover:bg-brand-plum/40 transition-all duration-700">
                  <h3 className="text-white text-[13px] tracking-[0.4em] font-black uppercase leading-relaxed text-center drop-shadow-xl">{cat.name}</h3>
                  <div className="h-[2px] w-0 bg-white mt-4 group-hover:w-16 transition-all duration-700" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Collections */}
      <section className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
          <div className="space-y-6">
            <span className="text-[11px] tracking-[0.4em] text-brand-plum/40 font-black uppercase">FROM OUR LOOMS</span>
            <h2 className="text-5xl md:text-7xl font-serif text-brand-plum">Newly Launched</h2>
          </div>
          <Link to="/category/New%20Arrivals" className="text-[11px] tracking-[0.3em] font-black text-brand-charcoal border-b-2 border-brand-charcoal pb-2 hover:text-brand-plum hover:border-brand-plum transition-all">
            EXPLORE ENTIRE SHOP
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-gray-50 animate-pulse rounded-sm" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-y-24">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Quality Banner */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
         <img 
            src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=2000" 
            className="absolute inset-0 w-full h-full object-cover object-center" 
            alt=""
         />
         <div className="absolute inset-0 bg-brand-charcoal/40" />
         <div className="relative z-10 max-w-4xl mx-auto text-center px-6 space-y-12">
            <h2 className="text-4xl md:text-7xl font-serif text-white italic drop-shadow-2xl leading-tight">"Where every thread weaves a tale of timeless grace."</h2>
            <div className="flex justify-center">
               <Link to="/category/All" className="bg-white text-brand-plum px-12 py-5 text-[11px] tracking-[0.4em] font-black uppercase hover:bg-brand-plum hover:text-white transition-all duration-500 rounded-sm">
                 START YOUR JOURNEY
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
}
