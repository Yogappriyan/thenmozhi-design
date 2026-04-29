import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS, handleFirestoreError, OperationType } from '../lib/firebase';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Package, CreditCard, MapPin, Clock, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_OPTIONS = [ 'placed', 'processing', 'shipped', 'delivered' ];
const PAYMENT_OPTIONS = [ 'pending', 'confirmed' ];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.ORDERS), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.ORDERS);
    });
    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (id: string, field: 'status' | 'paymentStatus', val: string) => {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, id);
      await updateDoc(docRef, { 
        [field]: val,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.orderId.toLowerCase().includes(search.toLowerCase()) || 
    o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    o.customer.phone.includes(search)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div className="flex items-center space-x-6">
          <Link to="/admin" className="text-gray-400 hover:text-brand-charcoal transition-colors">
            <h2 className="text-5xl font-serif">Orders</h2>
          </Link>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID, Name or Phone"
            className="w-full pl-12 pr-4 py-3 border border-gray-100 bg-white focus:outline-none focus:border-brand-charcoal text-sm font-light"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-50 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-12">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-serif">No orders found.</div>
          ) : (
            filteredOrders.map((order) => (
              <motion.div 
                key={order.id}
                layout
                className="bg-white border border-gray-100 p-8 space-y-10 group hover:shadow-xl transition-shadow"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-bold tracking-tight text-brand-charcoal">{order.orderId}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                       {order.customer.name} · {order.customer.phone} · {new Date(order.createdAt?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹{order.total.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8 border-t border-gray-50">
                  {/* Customer & Address */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] tracking-[0.2em] font-bold text-gray-400 uppercase flex items-center space-x-2">
                       <MapPin size={12} />
                       <span>CUSTOMER DETAILS</span>
                    </h4>
                    <div className="text-xs space-y-2 text-gray-600 font-light leading-relaxed">
                       <p className="font-bold text-brand-charcoal uppercase">{order.customer.name}</p>
                       <p className="text-blue-500 font-medium">{order.customer.email}</p>
                       <p className="text-brand-charcoal font-medium">{order.customer.phone}</p>
                       <p className="pt-2">{order.customer.address}</p>
                       <p className="pt-2 italic text-gray-400">UPI TXN: {order.upiTransactionId || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Order & Payment Controls */}
                  <div className="space-y-8 lg:col-span-1">
                    <div className="space-y-4">
                      <h4 className="text-[10px] tracking-[0.2em] font-bold text-gray-400 uppercase flex items-center space-x-2">
                        <Package size={12} />
                        <span>ORDER STATUS</span>
                      </h4>
                      <div className="relative">
                        <select 
                          className="w-full appearance-none border border-gray-100 p-3 bg-gray-50 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-charcoal cursor-pointer"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id!, 'status', e.target.value)}
                        >
                          {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] tracking-[0.2em] font-bold text-gray-400 uppercase flex items-center space-x-2">
                        <CreditCard size={12} />
                        <span>PAYMENT STATUS</span>
                      </h4>
                      <div className="relative">
                        <select 
                          className="w-full appearance-none border border-gray-100 p-3 bg-gray-50 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-charcoal cursor-pointer"
                          value={order.paymentStatus}
                          onChange={(e) => updateOrderStatus(order.id!, 'paymentStatus', e.target.value)}
                        >
                          {PAYMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] tracking-[0.2em] font-bold text-gray-400 uppercase flex items-center space-x-2">
                       <Clock size={12} />
                       <span>ORDER ITEMS</span>
                    </h4>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center space-x-4">
                           <div className="w-10 h-14 bg-gray-100 flex-shrink-0">
                             <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-grow">
                              <p className="text-[10px] font-medium uppercase line-clamp-1">{item.name}</p>
                              <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-bold text-gray-400 pt-1">
                                <span>SIZE: {item.selectedSize}</span>
                                <span>QTY: {item.quantity}</span>
                                <span className="text-brand-charcoal underline">₹{item.price}</span>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
