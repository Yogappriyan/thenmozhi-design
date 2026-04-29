import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import { Order } from '../types';
import { motion } from 'motion/react';
import { Search, Clock, CheckCircle2, Box, MapPin, CheckSquare, ShoppingBag } from 'lucide-react';

const STATUS_STEPS = [
  { id: 'pending', label: 'PENDING', subLabel: 'ORDER RECEIVED', icon: Clock },
  { id: 'confirmed', label: 'CONFIRMED', subLabel: 'PAYMENT VERIFIED', icon: CheckCircle2 },
  { id: 'shipped', label: 'SHIPPED', subLabel: 'IN TRANSIT', icon: Box },
  { id: 'out-for-delivery', label: 'OUT FOR DELIVERY', subLabel: 'ALMOST THERE', icon: MapPin },
  { id: 'delivered', label: 'DELIVERED', subLabel: 'ENJOY YOUR JEWELRY!', icon: CheckSquare },
];

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const isSuccess = searchParams.get('success') === 'true';
  const [orderIdInput, setOrderIdInput] = useState(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, COLLECTIONS.ORDERS), where('orderId', '==', id), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setError('No order found with this ID. Please check and try again.');
        setOrder(null);
      } else {
        const data = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Order;
        setOrder(data);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching the order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchOrder(initialId);
    }
  }, [initialId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;
    fetchOrder(orderIdInput.trim());
  };

  const getStatusIndex = (status: string) => {
    // Map existing statuses to our new steps if necessary
    const mapping: Record<string, string> = {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'processing': 'confirmed',
      'shipped': 'shipped',
      'delivered': 'delivered'
    };
    const mappedStatus = mapping[status] || status;
    return STATUS_STEPS.findIndex(s => s.id === mappedStatus);
  };
  
  const currentIdx = order ? getStatusIndex(order.status) : -1;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 space-y-12">
        <div className="text-center space-y-6">
          <p className="text-brand-charcoal/60 text-sm md:text-base font-light tracking-wide">
            Enter your Order ID to check the current status of your purchase.
          </p>

          <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
            <div className="relative group">
              <input 
                type="text" 
                className="w-full bg-[#FAFAFA] border border-gray-100 py-6 pl-16 pr-32 focus:outline-none focus:border-brand-champagne transition-all font-light text-lg tracking-wider"
                placeholder="TC-20260425-8336"
                value={orderIdInput}
                onChange={e => setOrderIdInput(e.target.value)}
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-champagne transition-colors" size={24} strokeWidth={1.5} />
              <button 
                type="submit"
                className="absolute right-3 top-3 bottom-3 bg-[#2D2D2D] text-white px-10 text-[11px] font-bold tracking-[0.2em] hover:bg-black transition-colors"
                disabled={loading}
              >
                {loading ? '...' : 'TRACK'}
              </button>
            </div>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-8 left-0 right-0 text-[11px] text-red-500 font-bold tracking-wider"
              >
                {error}
              </motion.p>
            )}
          </form>
        </div>

        {order && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-24 pt-8"
          >
            {isSuccess && (
              <div className="bg-green-50/50 border border-green-100 p-8 text-center space-y-2 max-w-3xl mx-auto">
                <span className="inline-block px-4 py-1 bg-green-100 text-green-800 text-[10px] font-black tracking-[0.2em] mb-2">SUCCESS</span>
                <h3 className="text-green-800 font-serif text-2xl uppercase">Order Placed Successfully</h3>
                <p className="text-sm text-green-700/80 font-light max-w-md mx-auto">Thank you for your trust. We've received your request and are preparing your collection pieces.</p>
              </div>
            )}

            {/* Status Banner Card */}
            <div className="max-w-6xl mx-auto bg-[#2D2D2D] text-white px-10 py-12 md:px-16 md:py-20 flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-brand-champagne/30" />
               <div className="space-y-4 text-center md:text-left">
                 <p className="text-[10px] tracking-[0.3em] font-black text-gray-400 uppercase">STATUS OF ORDER</p>
                 <h2 className="text-3xl md:text-5xl font-serif text-brand-champagne tracking-wider leading-none">
                    {order.orderId}
                 </h2>
               </div>
               <div className="space-y-4 text-center md:text-right">
                 <p className="text-[10px] tracking-[0.3em] font-black text-gray-400 uppercase">ESTIMATED DELIVERY</p>
                 <p className="text-2xl md:text-4xl font-serif tracking-wide leading-none">
                   5-7 Business Days
                 </p>
               </div>
            </div>

            {/* Progress Stepper */}
            <div className="max-w-6xl mx-auto px-4">
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-12 md:gap-0">
                {/* Connection Line */}
                <div className="hidden md:block absolute top-[28px] left-[5%] right-[5%] h-1 bg-gray-100 z-0">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="h-full bg-brand-champagne shadow-[0_0_10px_rgba(229,213,197,0.5)]"
                  />
                </div>

                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentIdx;
                  const isActive = idx === currentIdx;
                  const Icon = step.icon;

                  return (
                    <div key={step.id} className="relative z-10 flex md:flex-col items-center gap-6 md:gap-8 w-full md:w-auto">
                      <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-500 shrink-0",
                        isCompleted ? "bg-[#8E7960] border-[#8E7960] text-white shadow-lg" : "bg-white border-gray-100 text-gray-300"
                      )}>
                        <Icon size={24} strokeWidth={1.5} className={isActive ? "animate-pulse" : ""} />
                      </div>
                      <div className="text-left md:text-center space-y-1.5 pt-2">
                        <h4 className={cn(
                          "text-[10px] md:text-[11px] font-black tracking-[0.2em] uppercase",
                          isCompleted ? "text-brand-charcoal" : "text-gray-300"
                        )}>
                          {step.label}
                        </h4>
                        <p className={cn(
                          "text-[9px] font-bold tracking-widest uppercase",
                          isCompleted ? "text-brand-champagne/80" : "text-gray-200"
                        )}>
                          {step.subLabel}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Order Info Drawer */}
            <div className="max-w-6xl mx-auto pt-24 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-16">
               <div className="space-y-6">
                 <h3 className="text-[11px] font-black tracking-[0.3em] text-brand-charcoal uppercase">Order Information</h3>
                 <div className="space-y-3">
                   <div className="flex justify-between text-xs">
                     <span className="text-gray-400 font-light">Status</span>
                     <span className="font-bold uppercase text-brand-champagne">{order.status}</span>
                   </div>
                   <div className="flex justify-between text-xs">
                     <span className="text-gray-400 font-light">Placed On</span>
                     <span className="font-bold">{new Date(order.createdAt?.toDate()).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                   </div>
                   <div className="flex justify-between text-xs">
                     <span className="text-gray-400 font-light">Payment</span>
                     <span className="font-bold uppercase">{order.paymentStatus}</span>
                   </div>
                 </div>
               </div>

               <div className="space-y-6">
                 <h3 className="text-[11px] font-black tracking-[0.3em] text-brand-charcoal uppercase">Shipping Destination</h3>
                 <div className="space-y-2">
                    <p className="text-sm font-bold uppercase tracking-wider">{order.customer.name}</p>
                    <p className="text-xs text-gray-500 font-light leading-loose">{order.customer.address}</p>
                    <div className="pt-2 flex items-center gap-2 text-brand-charcoal text-[11px] font-bold">
                      <span className="w-1 h-1 bg-brand-champagne rounded-full" />
                      {order.customer.phone}
                    </div>
                 </div>
               </div>

               <div className="space-y-6">
                 <h3 className="text-[11px] font-black tracking-[0.3em] text-brand-charcoal uppercase">Collection Items</h3>
                 <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-100">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex gap-4 group">
                         <div className="w-14 h-20 bg-gray-50 overflow-hidden shrink-0">
                           <img src={item.images[0]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                         </div>
                         <div className="flex flex-col justify-center gap-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal leading-tight line-clamp-2">{item.name}</p>
                            <p className="text-[9px] text-[#8E7960] font-black tracking-widest uppercase">Qty {item.quantity} • Size {item.selectedSize}</p>
                         </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!order && !loading && !initialId && (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-10">
             <div className="relative">
                <div className="w-40 h-40 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                  <ShoppingBag size={64} strokeWidth={0.5} />
                </div>
                <motion.div 
                  className="absolute -top-4 -right-4 w-12 h-12 bg-brand-champagne rounded-full shadow-lg flex items-center justify-center"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <MapPin size={20} className="text-white" />
                </motion.div>
             </div>
             <div className="space-y-4 max-w-sm">
                <h3 className="text-xl font-serif text-brand-charcoal">Awaiting Your Order</h3>
                <p className="text-[11px] tracking-[0.1em] text-gray-400 uppercase font-light leading-relaxed">
                  Enter your unique collection tracking reference above. Once your payment is verified, piece updates will appear here in real-time.
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
