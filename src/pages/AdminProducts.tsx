import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Upload, Trash2, Edit2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = ['New Arrivals', 'Best Sellers', 'Skirts & Dresses', 'Sarees', 'Kurti Sets', 'Blouses', 'Deals'];
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: 'Kurti Sets',
    images: [] as string[],
    sizes: [] as string[],
    inventory: 10,
    featured: false
  });

  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.PRODUCTS), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.PRODUCTS);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = { 
        ...form, 
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        inventory: Number(form.inventory),
        updatedAt: serverTimestamp(),
        createdAt: form.createdAt || serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, COLLECTIONS.PRODUCTS, editingId), productData);
      } else {
        await addDoc(collection(db, COLLECTIONS.PRODUCTS), productData);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, COLLECTIONS.PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (p?: Product) => {
    if (p) {
      setForm({ ...p });
      setEditingId(p.id!);
    } else {
      setForm({
        name: '',
        description: '',
        price: 0,
        originalPrice: 0,
        category: 'Kurti Sets',
        images: [],
        sizes: [],
        inventory: 10,
        featured: false,
        createdAt: null
      } as any);
      setEditingId(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div className="flex items-center space-x-6">
          <Link to="/admin" className="text-gray-400 hover:text-brand-charcoal transition-colors">
            <h2 className="text-5xl font-serif">Products</h2>
          </Link>
          <span className="text-gray-200">/</span>
          <span className="text-[10px] tracking-widest font-bold text-gray-400">{products.length} ITEMS</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" 
              placeholder="Search products..."
              className="pl-12 pr-4 py-3 border border-gray-100 focus:outline-none focus:border-brand-charcoal text-sm font-light w-64"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-brand-charcoal text-white px-8 py-3 text-xs font-bold tracking-widest hover:bg-brand-champagne transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>ADD NEW</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <AnimatePresence>
            {filteredProducts.map((p) => (
              <motion.div 
                key={p.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-gray-100 p-4 space-y-4 relative group"
              >
                <div className="aspect-[3/4] bg-gray-50 overflow-hidden relative">
                   <img src={p.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(p)} className="p-2 bg-white text-brand-charcoal shadow-lg hover:text-brand-champagne"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(p.id!)} className="p-2 bg-white text-red-500 shadow-lg hover:bg-red-50"><Trash2 size={14} /></button>
                   </div>
                </div>
                <div className="space-y-1">
                   <h3 className="text-xs font-bold uppercase truncate">{p.name}</h3>
                   <p className="text-[9px] tracking-widest text-gray-400 uppercase font-bold">{p.category} · QTY: {p.inventory}</p>
                   <p className="text-sm font-semibold">₹{p.price.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
         </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-charcoal/60 backdrop-blur-sm" 
              onClick={closeModal}
             />
             <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 p-12 custom-scrollbar"
             >
                <div className="flex justify-between items-center mb-12">
                   <h2 className="text-4xl font-serif">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                   <button onClick={closeModal}><X size={24} /></button>
                </div>

                <form onSubmit={handleSave} className="space-y-12">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">PRODUCT NAME</label>
                            <input 
                              required
                              className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-brand-charcoal text-sm font-light"
                              value={form.name}
                              onChange={e => setForm({ ...form, name: e.target.value })}
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">CATEGORY</label>
                            <select 
                              className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-brand-charcoal text-sm font-light bg-transparent"
                              value={form.category}
                              onChange={e => setForm({ ...form, category: e.target.value })}
                            >
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                         </div>
                         <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">PRICE (₹)</label>
                              <input 
                                required
                                type="number"
                                className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-brand-charcoal text-sm font-light"
                                value={form.price}
                                onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">ORIGINAL PRICE (₹)</label>
                              <input 
                                type="number"
                                className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-brand-charcoal text-sm font-light"
                                value={form.originalPrice}
                                onChange={e => setForm({ ...form, originalPrice: Number(e.target.value) })}
                              />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">INVENTORY COUNT</label>
                            <input 
                              required
                              type="number"
                              className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-brand-charcoal text-sm font-light"
                              value={form.inventory}
                              onChange={e => setForm({ ...form, inventory: Number(e.target.value) })}
                            />
                         </div>
                         <div className="flex items-center space-x-3">
                            <input 
                              type="checkbox"
                              id="featured"
                              checked={form.featured}
                              onChange={e => setForm({ ...form, featured: e.target.checked })}
                            />
                            <label htmlFor="featured" className="text-[10px] font-bold tracking-widest text-gray-400 uppercase cursor-pointer">FEATURE ON HOME PAGE</label>
                         </div>
                      </div>

                      <div className="space-y-8">
                         <div className="space-y-4">
                            <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">SIZES</label>
                            <div className="flex flex-wrap gap-2">
                               {SIZE_OPTIONS.map(size => (
                                 <button
                                  type="button"
                                  key={size}
                                  onClick={() => toggleSize(size)}
                                  className={cn(
                                    "px-3 py-2 text-[10px] font-bold border transition-colors",
                                    form.sizes.includes(size) ? "bg-brand-charcoal text-white border-brand-charcoal" : "border-gray-100 hover:border-brand-charcoal"
                                  )}
                                 >
                                   {size}
                                 </button>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-4">
                            <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">IMAGE URLS</label>
                            <div className="space-y-3">
                               {form.images.map((url, i) => (
                                 <div key={i} className="flex space-x-2">
                                    <input 
                                      className="flex-grow border-b border-gray-200 py-2 text-xs font-light"
                                      value={url}
                                      onChange={e => {
                                        const newImgs = [...form.images];
                                        newImgs[i] = e.target.value;
                                        setForm({ ...form, images: newImgs });
                                      }}
                                    />
                                    <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })} className="text-red-400"><X size={14} /></button>
                                 </div>
                               ))}
                               <button 
                                 type="button"
                                 onClick={() => setForm({ ...form, images: [...form.images, ''] })}
                                 className="text-[10px] font-bold tracking-widest text-brand-champagne flex items-center space-x-1"
                               >
                                 <Plus size={12} />
                                 <span>ADD IMAGE URL</span>
                               </button>
                            </div>
                         </div>

                         <div className="space-y-2">
                            <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">DESCRIPTION</label>
                            <textarea 
                              rows={5}
                              className="w-full border border-gray-100 p-4 focus:outline-none focus:border-brand-charcoal text-sm font-light bg-gray-50"
                              placeholder="Product details, material, care instructions..."
                              value={form.description}
                              onChange={e => setForm({ ...form, description: e.target.value })}
                            />
                         </div>
                      </div>
                   </div>

                   <div className="pt-12 border-t border-gray-100 flex justify-end space-x-6">
                      <button type="button" onClick={closeModal} className="text-[10px] font-bold tracking-widest uppercase">CANCEL</button>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="bg-brand-charcoal text-white px-12 py-4 text-[10px] font-bold tracking-widest hover:bg-brand-champagne transition-colors disabled:opacity-50"
                      >
                        {loading ? 'SAVING...' : 'SAVE PRODUCT'}
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
