import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle, logout } from '../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { GoogleAuthProvider } from 'firebase/auth';
import { LayoutDashboard, ShoppingBag, Package, LogOut, ChevronRight, ShieldCheck, Mail, Lock } from 'lucide-react';

// SHA-256 hash of "vk@@1005"
const ADMIN_PASS_HASH = "8f38c351f044d79198642157a58ed8bc7250e633d31707019280d08796cd1f1e";

async function hashPassword(password: string) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [passInput, setPassInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passError, setPassError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    pending: 0
  });

  const fetchStats = async () => {
    const { getDocs, collection } = await import('firebase/firestore');
    const { db, COLLECTIONS } = await import('../lib/firebase');
    
    try {
      const productsSnap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      const ordersSnap = await getDocs(collection(db, COLLECTIONS.ORDERS));
      
      const orders = ordersSnap.docs.map(d => d.data());
      const revenue = orders.reduce((acc, curr) => acc + (curr.total || 0), 0);
      const pending = orders.filter(o => o.status === 'pending').length;

      setStats({
        products: productsSnap.size,
        orders: ordersSnap.size,
        revenue,
        pending
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchStats();
    }
  }, [isUnlocked]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPass = passInput.trim();
    const hash = await hashPassword(trimmedPass);
    if (hash === ADMIN_PASS_HASH || trimmedPass === 'vk@@1005') {
      setIsUnlocked(true);
      setPassError(false);
      localStorage.setItem('admin_unlocked', 'true');
    } else {
      setPassError(true);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('admin_unlocked') === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  if (!user || (!isUnlocked && !isAdmin)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50/50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden"
        >
          {/* Top accent bar */}
          <div className="h-2 bg-brand-champagne w-full" />
          
          <div className="p-12 text-center space-y-12">
            <div className="space-y-4">
              <h1 className="text-3xl font-serif text-brand-charcoal">Admin Access</h1>
              <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">LOGIN TO MANAGE THENMOZHI DESIGNS</p>
            </div>

            {user && !isAdmin ? (
               <div className="space-y-6">
                 <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                    <Mail size={24} />
                 </div>
                 <div className="space-y-2">
                   <p className="text-sm font-medium text-brand-charcoal">Unauthorized Account</p>
                   <p className="text-xs text-gray-400 font-light px-4">
                     Your account <span className="font-bold">({user.email})</span> does not have administrative privileges.
                   </p>
                 </div>
                 <button 
                  onClick={logout}
                  className="text-[10px] font-bold tracking-widest text-brand-charcoal border-b border-brand-charcoal pb-1 hover:text-brand-champagne hover:border-brand-champagne transition-colors"
                 >
                   SIGN IN WITH DIFFERENT ACCOUNT
                 </button>
               </div>
            ) : (
              <form onSubmit={handleUnlock} className="space-y-8 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">ADMIN EMAIL</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="email"
                      required
                      className="w-full bg-gray-50 border border-transparent focus:border-brand-champagne py-4 pl-12 pr-4 text-sm font-light focus:outline-none transition-all rounded-lg cursor-not-allowed"
                      placeholder="admin@thenmozhi.com"
                      value={user?.email || ''}
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">PASSWORD</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="password"
                      required
                      className="w-full bg-gray-50 border border-transparent focus:border-brand-champagne py-4 pl-12 pr-4 text-sm font-light focus:outline-none transition-all rounded-lg"
                      placeholder="••••••••"
                      value={passInput}
                      onChange={e => setPassInput(e.target.value)}
                    />
                  </div>
                </div>

                {passError && <p className="text-[10px] text-red-500 font-bold tracking-widest text-center">INVALID CREDENTIALS</p>}

                {!user ? (
                  <button 
                    type="button"
                    onClick={loginWithGoogle}
                    className="w-full bg-brand-charcoal text-white py-5 text-[10px] font-bold tracking-[0.3em] hover:bg-brand-champagne hover:text-brand-charcoal transition-all flex items-center justify-center space-x-3 rounded-lg group"
                  >
                    <span>SIGN IN WITH GOOGLE</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button 
                    type="submit"
                    className="w-full bg-brand-charcoal text-white py-5 text-[10px] font-bold tracking-[0.3em] hover:bg-brand-champagne hover:text-brand-charcoal transition-all flex items-center justify-center space-x-3 rounded-lg group"
                  >
                    <span>LOGIN AS ADMIN</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </form>
            )}

            <div className="pt-8 border-t border-gray-100 flex items-center justify-center space-x-2 text-[9px] text-gray-400 font-bold tracking-widest uppercase">
              <ShieldCheck size={12} />
              <span>SECURE & ENCRYPTED ACCESS</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const seedData = async () => {
    if (!confirm('This will add 60 products across all categories. Continue?')) return;
    const { seedDatabase } = await import('../seed');
    setLoading(true);
    try {
      await seedDatabase();
      await fetchStats();
      alert('Success! 60 products have been added to your store. You can now see them in the gallery and inventory sections.');
    } catch (err) {
      alert('Error during seeding. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-serif">Store Dashboard</h1>
          <div className="flex items-center space-x-3 text-[10px] tracking-[0.2em] font-bold text-gray-400">
            <span className="uppercase">ADMIN: THENMOZHI DESIGNS</span>
            <div className="w-1 h-1 bg-brand-champagne rounded-full" />
            <span className="text-brand-charcoal">{user.email}</span>
            <button 
              onClick={seedData} 
              disabled={loading}
              className="ml-6 px-4 py-1.5 border border-brand-champagne text-brand-champagne text-[9px] font-bold tracking-widest hover:bg-brand-champagne hover:text-white transition-all rounded-full disabled:opacity-50"
            >
              {loading ? 'SEEDING...' : 'SETUP SAMPLE STORE'}
            </button>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center space-x-2 text-[10px] tracking-widest font-bold text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={16} />
          <span>SIGN OUT</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {[
          { label: 'PRODUCTS', value: stats.products, icon: Package },
          { label: 'TOTAL ORDERS', value: stats.orders, icon: ShoppingBag },
          { label: 'REVENUE', value: `₹${stats.revenue.toLocaleString()}`, icon: LayoutDashboard },
          { label: 'PENDING PAYMENTS', value: stats.pending, icon: ShieldCheck },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-gray-100 p-8 flex flex-col justify-between h-40 group hover:border-brand-champagne transition-colors"
          >
            <div className="flex items-center space-x-3 text-gray-400 group-hover:text-brand-champagne transition-colors">
              <stat.icon size={18} strokeWidth={1.5} />
              <span className="text-[10px] tracking-[0.1em] font-bold uppercase">{stat.label}</span>
            </div>
            <span className="text-4xl font-serif">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link 
          to="/admin/products"
          className="group bg-white border border-gray-100 p-12 hover:border-brand-charcoal transition-all space-y-6"
        >
          <div className="space-y-2">
            <h3 className="text-2xl font-serif">Manage Products</h3>
            <p className="text-xs text-gray-400 font-light">Add, edit, delete products and manage stock</p>
          </div>
          <div className="flex items-center text-[10px] tracking-widest font-bold text-brand-charcoal group-hover:translate-x-4 transition-transform">
            <span>GO TO INVENTORY</span>
            <ChevronRight size={14} className="ml-2" />
          </div>
        </Link>

        <Link 
          to="/admin/orders"
          className="group bg-white border border-gray-100 p-12 hover:border-brand-charcoal transition-all space-y-6"
        >
          <div className="space-y-2">
            <h3 className="text-2xl font-serif">Manage Orders</h3>
            <p className="text-xs text-gray-400 font-light">View orders, update status, confirm payments</p>
          </div>
          <div className="flex items-center text-[10px] tracking-widest font-bold text-brand-charcoal group-hover:translate-x-4 transition-transform">
            <span>VIEW ALL ORDERS</span>
            <ChevronRight size={14} className="ml-2" />
          </div>
        </Link>
      </div>
    </div>
  );
}
