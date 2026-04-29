import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { db, COLLECTIONS, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { ChevronLeft, Info, Phone, Copy, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    upiTxn: ''
  });

  const OWNER_PHONE = "9488424266";
  const UPI_ID = "9488424266@ybl"; // Example UPI, using owner's number as per request

  if (cart.length === 0 && !loading && !isSuccess) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate a clean Order ID
      const timestamp = Date.now().toString().slice(-4);
      const random = Math.floor(1000 + Math.random() * 9000);
      const orderId = `TC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${random}`;

      const orderData = {
        orderId,
        items: cart,
        total: totalPrice,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
        status: 'placed',
        paymentStatus: 'pending',
        upiTransactionId: formData.upiTxn,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, COLLECTIONS.ORDERS), orderData);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E5D5C5', '#1A1A1A', '#ffffff']
      });

      setIsSuccess(true);
      clearCart();
      // Navigate immediately
      navigate(`/track-order?id=${orderId}&success=true`, { replace: true });
      return; // Stop execution here as we are navigating
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, COLLECTIONS.ORDERS);
      setLoading(false); // Ensure loading is stopped on error
    } 
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 lg:py-32">
      <button onClick={() => navigate('/cart')} className="flex items-center space-x-2 text-[10px] tracking-widest font-bold mb-12 hover:opacity-60 transition-opacity">
        <ChevronLeft size={14} />
        <span>BACK TO BAG</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        {/* Left: Form */}
        <div className="space-y-16">
           <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-serif">Checkout Details</h1>
              <p className="text-xs text-gray-400 font-light tracking-wide uppercase">PLEASE PROVIDE YOUR DELIVERY INFORMATION</p>
           </div>

           <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">FULL NAME</label>
                    <input 
                      required
                      type="text"
                      className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-brand-charcoal transition-colors text-sm font-light"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">EMAIL ADDRESS</label>
                    <input 
                      required
                      type="email"
                      className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-brand-charcoal transition-colors text-sm font-light"
                      placeholder="example@mail.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">PHONE NUMBER</label>
                <input 
                  required
                  type="tel"
                  className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-brand-charcoal transition-colors text-sm font-light"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">DELIVERY ADDRESS</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full border border-gray-100 p-4 focus:outline-none focus:border-brand-charcoal transition-colors text-sm font-light bg-gray-50 lg:bg-transparent"
                  placeholder="Complete shipping address with pincode"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="pt-10 border-t border-gray-100">
                <div className="bg-brand-charcoal text-white p-8 space-y-6">
                   <div className="flex items-center space-x-3 mb-2">
                      <Phone size={16} className="text-brand-champagne" />
                      <h3 className="text-[10px] tracking-[0.2em] font-bold uppercase">PAYMENT VIA OWNER</h3>
                   </div>
                   <p className="text-xs text-brand-champagne/80 font-light leading-relaxed">
                     Please pay the total amount using the Owner's mobile number via UPI or WhatsApp for manual verification.
                   </p>
                   
                   <div className="flex items-center justify-between bg-white/5 p-4 border border-white/10">
                      <div>
                        <p className="text-[9px] text-gray-400 tracking-widest font-bold uppercase mb-1">OWNER'S UPI ID</p>
                        <p className="text-lg font-mono text-brand-champagne tracking-wider">{UPI_ID}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => copyToClipboard(UPI_ID)} 
                        className="hover:scale-110 transition-transform p-2 bg-white/10 rounded"
                      >
                         {copied ? <CheckCircle2 size={18} className="text-green-400" /> : <Copy size={18} />}
                      </button>
                   </div>
                   
                   <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">UPI TRANSACTION ID (OPTIONAL)</label>
                    <input 
                      type="text"
                      className="w-full bg-white/5 border border-white/10 p-3 focus:outline-none focus:border-brand-champagne transition-colors text-sm text-white font-mono"
                      placeholder="Paste your 12-digit UPI Txn ID"
                      value={formData.upiTxn}
                      onChange={e => setFormData({ ...formData, upiTxn: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-brand-charcoal text-white py-6 px-8 text-xs font-bold tracking-[0.4em] hover:bg-brand-champagne hover:text-brand-charcoal transition-all disabled:opacity-50 flex items-center justify-center space-x-4 shadow-xl"
              >
                {loading ? 'PROCESSING...' : `PLACE ORDER - ₹${totalPrice.toLocaleString()}`}
              </button>
           </form>
        </div>

        {/* Right: Summary */}
        <div className="space-y-12">
            <div className="bg-gray-50 p-10">
              <h3 className="text-[10px] font-bold tracking-[0.2em] mb-10 text-gray-400 uppercase">ORDER SUMMARY</h3>
              <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 mb-10 border-b border-gray-200 pb-10">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex items-center space-x-6">
                    <div className="w-16 h-20 bg-white shadow-sm flex-shrink-0">
                      <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                       <h4 className="text-xs font-medium uppercase tracking-tight line-clamp-1">{item.name}</h4>
                       <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">SIZE {item.selectedSize} × {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 uppercase tracking-widest">SUBTOTAL</span>
                  <span className="font-bold">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs pt-4 border-t border-gray-200">
                  <span className="text-brand-charcoal font-bold tracking-[0.2em] uppercase">TOTAL AMOUNT</span>
                  <span className="text-2xl font-serif">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-8 border-2 border-brand-champagne/30 text-center space-y-4">
               <div className="w-10 h-10 bg-brand-champagne/10 text-brand-champagne rounded-full flex items-center justify-center mx-auto mb-2">
                 <Info size={20} />
               </div>
               <h4 className="text-[10px] font-bold tracking-widest uppercase">SECURE PAYMENT PROMISE</h4>
               <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                 All orders are manually verified by our team. Once you complete the payment to the owner's mobile number, you'll receive a confirmation call or SMS within 24 hours.
               </p>
            </div>
        </div>
      </div>
    </div>
  );
}
