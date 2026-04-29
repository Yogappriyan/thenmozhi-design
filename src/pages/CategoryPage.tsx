import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, COLLECTIONS, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product } from '../types';
import { motion } from 'motion/react';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block overflow-hidden bg-gray-100 aspect-[3/4]">
        <img 
          src={product.images[0].replace('w=2000', 'w=600').replace('w=1200', 'w=600')} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-md hidden lg:block">
           <div className="flex flex-wrap gap-2 justify-center">
              {product.sizes.map(size => (
                <span key={size} className="text-[10px] font-bold border border-brand-charcoal px-2 py-1">{size}</span>
              ))}
           </div>
        </div>
      </Link>
      <div className="mt-4 text-center space-y-1">
        <h2 className="text-sm font-medium tracking-tight h-10 line-clamp-2 px-2 uppercase">{product.name}</h2>
        <h3 className="text-[10px] uppercase tracking-[0.1em] text-gray-400">{product.category}</h3>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm font-semibold">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function CategoryPage() {
  const { name } = useParams<{ name: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q;
        const decodedName = decodeURIComponent(name || '');
        if (decodedName === 'All') {
          q = query(collection(db, COLLECTIONS.PRODUCTS), limit(40));
        } else {
          q = query(
            collection(db, COLLECTIONS.PRODUCTS),
            where('category', '==', decodedName),
            limit(40)
          );
        }
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Product));
        
        data.sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0;
          const dateB = b.createdAt?.toMillis?.() || 0;
          return dateB - dateA;
        });

        setProducts(data);
      } catch (err) {
        console.error(err);
        handleFirestoreError(err, OperationType.LIST, COLLECTIONS.PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [name]);

  const decodedName = decodeURIComponent(name || 'Collection');

  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <div className="max-w-[1400px] mx-auto px-6 pt-12">
        <nav className="flex items-center space-x-2 text-[10px] tracking-[0.2em] text-brand-plum/60 font-medium uppercase">
          <Link to="/" className="hover:text-brand-plum transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-brand-plum transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-brand-plum">{decodedName}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center space-y-4 mb-24">
          <h1 className="text-5xl md:text-7xl font-serif text-brand-plum">{decodedName}</h1>
        </div>

        {/* Toolbar */}
        <div className="border-t border-b border-gray-100 flex items-center justify-between py-6 mb-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-brand-plum transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </button>
              <button className="text-gray-400 hover:text-brand-plum transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="7"></rect><rect x="3" y="14" width="18" height="7"></rect></svg>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-12">
             <div className="flex items-center space-x-2 text-[10px] tracking-[0.2em] font-bold text-gray-400 group cursor-pointer hover:text-brand-plum transition-colors">
               <span>SORT BY</span>
               <svg className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
             </div>
             <div className="flex items-center space-x-2 text-[10px] tracking-[0.2em] font-bold text-gray-400 group cursor-pointer hover:text-brand-plum transition-colors">
               <span>FILTER</span>
               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
             </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-sm" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32 text-gray-400 text-[10px] tracking-[0.3em] font-bold uppercase">No products currently available</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-y-16">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
