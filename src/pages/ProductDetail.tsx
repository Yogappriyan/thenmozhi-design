import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronRight, Share2, Info } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as Product;
          setProduct(data);
          if (data.sizes.length > 0) setSelectedSize(data.sizes[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToBag = () => {
    if (!product || !selectedSize) return;
    addToCart(product, selectedSize);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loading) return <div className="h-screen flex items-center justify-center animate-pulse text-brand-charcoal font-serif tracking-[0.2em] uppercase">THENMOZHI...</div>;
  if (!product) return <div className="p-20 text-center">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="flex items-center space-x-2 text-[10px] tracking-widest text-gray-400 mb-12 overflow-x-auto whitespace-nowrap">
        <span>HOME</span> <ChevronRight size={12} />
        <span>SHOP</span> <ChevronRight size={12} />
        <span className="uppercase">{product.category}</span> <ChevronRight size={12} />
        <span className="text-brand-charcoal font-bold truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "flex-shrink-0 w-20 h-24 md:w-24 md:h-32 border-2 transition-all p-1",
                  selectedImage === i ? "border-brand-charcoal" : "border-transparent"
                )}
              >
                <img src={img.replace('w=2000', 'w=200').replace('w=1200', 'w=200')} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-grow aspect-[3/4] bg-gray-100 overflow-hidden relative">
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={product.images[selectedImage].replace('w=2000', 'w=1000').replace('w=1200', 'w=1000')}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-serif leading-tight">{product.name}</h1>
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] tracking-[0.2em] font-bold mb-4 uppercase">SELECT SIZE</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "min-w-[50px] py-3 px-4 text-xs font-semibold border transition-all",
                      selectedSize === size ? "bg-brand-charcoal text-white border-brand-charcoal" : "bg-white text-brand-charcoal border-gray-200 hover:border-brand-charcoal"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button 
                onClick={handleAddToBag}
                className="flex-grow bg-brand-charcoal text-white py-5 px-8 text-xs font-bold tracking-[0.2em] hover:bg-brand-champagne hover:text-brand-charcoal transition-all flex items-center justify-center space-x-3"
              >
                <ShoppingBag size={18} />
                <span>ADD TO BAG</span>
              </button>
              <button className="p-5 border border-gray-200 hover:border-brand-charcoal transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-100 space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] tracking-[0.2em] font-bold uppercase flex items-center space-x-2">
                <Info size={14} />
                <span>PRODUCT DESCRIPTION</span>
              </h3>
              <p className="text-sm font-light text-gray-500 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-brand-champagne/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">✨</span>
                </div>
                <div>
                   <h4 className="text-[10px] font-bold tracking-wider mb-1 uppercase">AUTHENTIC FABRICS</h4>
                   <p className="text-[11px] text-gray-400 font-light">100% genuine quality materials sourced from artisans.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-brand-champagne/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">🚚</span>
                </div>
                <div>
                   <h4 className="text-[10px] font-bold tracking-wider mb-1 uppercase">FREE SHIPPING</h4>
                   <p className="text-[11px] text-gray-400 font-light">Pan India standard shipping included on all orders.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-brand-charcoal text-white px-8 py-4 shadow-2xl flex items-center space-x-4 min-w-[300px]"
          >
            <div className="w-10 h-10 bg-white/10 flex items-center justify-center">
               <ShoppingBag size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.1em] uppercase">ADDED TO BAG</p>
              <p className="text-[11px] text-gray-400 font-light">{product.name} - Size {selectedSize}</p>
            </div>
            <button onClick={() => navigate('/cart')} className="ml-auto text-[10px] font-bold text-brand-champagne tracking-[0.1em] underline">
              VIEW BAG
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
