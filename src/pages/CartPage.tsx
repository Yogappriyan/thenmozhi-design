import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-8">
        <div className="w-24 h-24 bg-brand-champagne/10 rounded-full flex items-center justify-center mx-auto text-gray-300">
          <ShoppingBag size={48} strokeWidth={1} />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-serif">Your Bag is Empty</h1>
          <p className="text-sm font-light text-gray-500 tracking-wide">Discovery awaits. Explore our latest collections to find your perfect piece.</p>
        </div>
        <Link 
          to="/category/All" 
          className="inline-block bg-brand-charcoal text-white px-12 py-4 text-[10px] tracking-[0.2em] font-semibold hover:bg-brand-champagne transition-colors"
        >
          START SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 lg:py-32">
       <h1 className="text-5xl font-serif text-center mb-20">Your Shopping Bag</h1>
       
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
         {/* Items */}
         <div className="lg:col-span-2 space-y-12">
            <div className="hidden md:grid grid-cols-6 pb-6 border-b border-gray-100 text-[10px] tracking-[0.2em] font-bold text-gray-400">
              <div className="col-span-3">PRODUCT</div>
              <div className="text-center">PRICE</div>
              <div className="text-center">QUANTITY</div>
              <div className="text-right">TOTAL</div>
            </div>

            <AnimatePresence>
              {cart.map((item) => (
                <motion.div 
                  key={`${item.id}-${item.selectedSize}`}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-6 items-center gap-8 pb-12 border-b border-gray-100 md:border-b-0"
                >
                  <div className="md:col-span-3 flex items-center space-x-6">
                    <Link to={`/product/${item.id}`} className="w-24 h-32 flex-shrink-0 bg-gray-50 overflow-hidden">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="space-y-2">
                       <h3 className="text-sm font-medium tracking-tight uppercase">{item.name}</h3>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">SIZE: {item.selectedSize}</p>
                       <button 
                        onClick={() => removeFromCart(item.id!, item.selectedSize)}
                        className="text-[10px] text-red-500 font-bold flex items-center space-x-1 pt-2 hover:opacity-60 transition-opacity"
                       >
                         <Trash2 size={12} />
                         <span>REMOVE</span>
                       </button>
                    </div>
                  </div>

                  <div className="flex justify-between md:block text-center">
                    <span className="md:hidden text-[10px] font-bold tracking-widest text-gray-400">PRICE</span>
                    <span className="text-sm font-medium tracking-tight">₹{item.price.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between md:block">
                    <span className="md:hidden text-[10px] font-bold tracking-widest text-gray-400">QUANTITY</span>
                    <div className="flex items-center justify-center space-x-4 border border-gray-200 py-2 px-4 w-fit mx-auto md:mx-auto">
                      <button onClick={() => updateQuantity(item.id!, item.selectedSize, -1)} className="hover:text-brand-champagne transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id!, item.selectedSize, 1)} className="hover:text-brand-champagne transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between md:block text-right">
                    <span className="md:hidden text-[10px] font-bold tracking-widest text-gray-400">TOTAL</span>
                    <span className="text-sm font-bold tracking-tight">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
         </div>

         {/* Summary */}
         <div className="lg:col-span-1">
            <div className="bg-brand-champagne/10 p-10 space-y-10 sticky top-32">
              <h2 className="text-2xl font-serif">Order Summary</h2>
              
              <div className="space-y-6">
                <div className="flex justify-between text-xs tracking-widest font-light">
                  <span className="text-gray-500 uppercase">Subtotal</span>
                  <span className="font-semibold text-brand-charcoal">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs tracking-widest font-light">
                  <span className="text-gray-500 uppercase">Shipping</span>
                  <span className="text-green-600 font-bold tracking-wider">FREE DELIVERY</span>
                </div>
                <div className="h-px bg-brand-charcoal/10" />
                <div className="flex justify-between items-baseline pt-4">
                  <span className="text-sm font-serif">Total Amount</span>
                  <span className="text-2xl font-serif">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-brand-charcoal text-white py-5 px-8 text-[10px] font-bold tracking-[0.3em] hover:bg-white hover:text-brand-charcoal transition-all border border-brand-charcoal flex items-center justify-center space-x-3 group"
                >
                  <span>CHECKOUT</span>
                  <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </button>
                <Link 
                  to="/category/All" 
                  className="block w-full text-center text-[10px] font-bold tracking-[0.2em] text-gray-400 py-2 hover:text-brand-charcoal transition-colors uppercase"
                >
                  CONTINUE SHOPPING
                </Link>
              </div>

              <div className="pt-6 border-t border-brand-charcoal/5 space-y-4">
                <p className="text-[9px] text-gray-500 font-light leading-relaxed text-center italic">
                  Check out securely with our UPI payment method.
                </p>
              </div>
            </div>
         </div>
       </div>
    </div>
  );
}
