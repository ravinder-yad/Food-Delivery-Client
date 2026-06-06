import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaTicketAlt, FaCopy, FaCheckCircle, FaShoppingBag, FaArrowLeft, FaGift } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Offers() {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/offers');
        setOffers(res.data || []);
      } catch (err) {
        console.error('Error fetching offers from server:', err);
        setError('Could not load promo codes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);
    
    // Reset copy state after 2 seconds
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    show: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-xs font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest mb-4 transition-colors focus:outline-none"
            >
              <FaArrowLeft className="text-[10px]" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
              <FaGift className="text-rose-500" />
              <span>Deals, Coupons & Offers</span>
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-2">
              Save big on your next hot meal! Click any code card to copy it to clipboard.
            </p>
          </div>

          {/* Cart Status Widget */}
          {cart.items.length > 0 && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center justify-between gap-6 shadow-sm"
            >
              <div>
                <p className="text-xs font-black text-rose-800 uppercase">Cart Active</p>
                <p className="text-xs text-rose-700/80 font-bold mt-0.5">{cart.items.length} items (₹{cart.totalAmount})</p>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 uppercase tracking-wide focus:outline-none"
              >
                <FaShoppingBag className="text-[10px]" />
                <span>Go to Checkout</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error Handle */}
        {error && !loading && (
          <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 space-y-4 shadow-sm">
            <span className="text-4xl">⚠️</span>
            <h3 className="text-lg font-bold text-gray-800">Connection Error</h3>
            <p className="text-sm text-gray-400 font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-6 py-2.5 rounded-full shadow-md transition-all text-xs uppercase tracking-wider"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Coupon Cards Grid */}
        {!loading && !error && offers.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {offers.map((offer) => {
              const isCopied = copiedCode === offer.couponCode;
              return (
                <motion.div
                  key={offer._id}
                  variants={cardVariants}
                  onClick={() => handleCopyCode(offer.couponCode)}
                  className="group relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden"
                >
                  {/* Decorative dashed lines for tickets style */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-6 h-6 rounded-full bg-gray-50 border border-gray-100 z-10"></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-6 h-6 rounded-full bg-gray-50 border border-gray-100 z-10"></div>

                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-rose-500 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full uppercase tracking-wider">
                        {offer.discount || 'Special Promo'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        offer.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {offer.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div>
                      <h3 className="font-extrabold text-lg text-gray-800 group-hover:text-rose-500 transition-colors">
                        {offer.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-semibold mt-1">
                        Use coupon code below to redeem. Valid for a limited time.
                      </p>
                    </div>
                  </div>

                  {/* Coupon Copy Code Box */}
                  <div className="mt-6 pt-4 border-t border-dashed border-gray-100 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 font-mono text-sm font-bold text-gray-700 select-all group-hover:bg-rose-50/50 group-hover:border-rose-100 transition-colors">
                      <FaTicketAlt className="text-gray-400 text-xs" />
                      <span>{offer.couponCode}</span>
                    </div>
                    
                    <button
                      type="button"
                      className={`p-2 rounded-xl flex items-center justify-center transition-all focus:outline-none ${
                        isCopied
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white'
                      }`}
                    >
                      {isCopied ? <FaCheckCircle className="text-sm" /> : <FaCopy className="text-sm" />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !error && offers.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-lg text-gray-400 font-semibold">No active coupon offers available today.</p>
          </div>
        )}

      </div>
    </div>
  );
}
