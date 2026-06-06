import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUtensils, FaMotorcycle, FaArrowLeft, FaCheckCircle, FaSpinner, FaLock, FaBuilding, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function BecomePartner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  
  const [activeTab, setActiveTab] = useState('restaurant'); // 'restaurant' | 'delivery'
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Registering...');
  const [success, setSuccess] = useState(false);
  const [registeredRole, setRegisteredRole] = useState('');

  // Pre-select tab from URL search parameters
  useEffect(() => {
    if (roleParam === 'delivery') {
      setActiveTab('delivery');
    } else {
      setActiveTab('restaurant');
    }
  }, [roleParam]);

  // Form States - Restaurant Partner
  const [restaurantForm, setRestaurantForm] = useState({
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    restaurantName: '',
    description: '',
    bannerImage: '',
    cuisine: '',
    deliveryPrice: '40',
    estimatedDeliveryTime: '30-40 mins'
  });

  // Form States - Delivery Partner
  const [deliveryForm, setDeliveryForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    vehicleType: 'Motorcycle',
    licenseNumber: '',
    city: 'Mumbai'
  });

  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    const f = restaurantForm;
    if (!f.ownerName || !f.email || !f.phone || !f.password || !f.restaurantName) {
      toast.error('Please fill in all required fields (marked *).');
      return;
    }

    setLoading(true);
    setLoadingText('Registering owner profile...');
    
    try {
      setTimeout(async () => {
        setLoadingText('Configuring restaurant menu parameters...');
        try {
          const res = await axios.post('http://localhost:5000/api/partners/restaurant', f);
          toast.success('Restaurant partner profile created!');
          setRegisteredRole('restaurant');
          setSuccess(true);
        } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Failed to register restaurant.');
          setLoading(false);
        }
      }, 1200);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    const f = deliveryForm;
    if (!f.name || !f.email || !f.phone || !f.password || !f.vehicleType) {
      toast.error('Please fill in all required fields (marked *).');
      return;
    }

    if (f.vehicleType !== 'Bicycle' && !f.licenseNumber) {
      toast.error('License number is required for motorized vehicles.');
      return;
    }

    setLoading(true);
    setLoadingText('Uploading driver onboarding documents...');
    
    try {
      setTimeout(async () => {
        setLoadingText('Allocating GPS node and registering partner...');
        try {
          const res = await axios.post('http://localhost:5000/api/partners/delivery', f);
          toast.success('Delivery partner rider registered!');
          setRegisteredRole('delivery');
          setSuccess(true);
        } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Failed to register driver.');
          setLoading(false);
        }
      }, 1200);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back navigation & Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-xs font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest mb-4 transition-colors focus:outline-none"
          >
            <FaArrowLeft className="text-[10px]" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">
            Partner With BiteDash
          </h1>
          <p className="text-sm text-gray-500 font-semibold mt-1.5">
            Grow your business or make money on your own terms. Join our fast-growing partner network!
          </p>
        </div>

        {/* Success Card Screen */}
        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100 text-center space-y-6 max-w-xl mx-auto"
          >
            <div className="w-20 h-20 bg-green-50 text-green-500 border border-green-100 rounded-full flex items-center justify-center text-4xl shadow-inner mx-auto animate-bounce">
              <FaCheckCircle />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-800">Onboarding Registration Complete!</h2>
              <p className="text-sm text-gray-400 font-semibold leading-relaxed">
                Welcome to the BiteDash Family! Your application has been approved and logged in our system.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-left space-y-3.5">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Accessing your portal:</h4>
              {registeredRole === 'restaurant' ? (
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  🏪 You can now use your email and password to log in to our **Restaurant Super Admin Panel** at <a href="http://localhost:5174/admin/login" className="text-rose-500 font-black hover:underline" target="_blank" rel="noreferrer">http://localhost:5174/</a> to set up your restaurant menu.
                </p>
              ) : (
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  🛵 You can now use your email and password to log in to our **Delivery Rider Console** at <a href="http://localhost:5175/login" className="text-rose-500 font-black hover:underline" target="_blank" rel="noreferrer">http://localhost:5175/</a> to accept delivery orders and track earnings.
                </p>
              )}
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm px-6 py-2.5 rounded-full shadow-md transition-all uppercase tracking-wide"
              >
                Go to Homepage
              </button>
            </div>
          </motion.div>
        ) : loading ? (
          /* Loading Authorization Screen */
          <div className="bg-white rounded-[2rem] p-16 shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto min-h-[400px]">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-rose-500 text-lg">🏪</div>
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-gray-800 text-xl">Securing Partner Channels</h3>
              <p className="text-xs text-gray-400 font-semibold animate-pulse">{loadingText}</p>
            </div>
          </div>
        ) : (
          /* Stateful Tabbed Form */
          <div className="space-y-6">
            {/* Tab Selection */}
            <div className="flex bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm max-w-md">
              <button
                type="button"
                onClick={() => setActiveTab('restaurant')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold transition-all focus:outline-none cursor-pointer ${
                  activeTab === 'restaurant'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-gray-500 hover:text-rose-500'
                }`}
              >
                <FaUtensils />
                <span>Restaurant Partner</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('delivery')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold transition-all focus:outline-none cursor-pointer ${
                  activeTab === 'delivery'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-gray-500 hover:text-rose-500'
                }`}
              >
                <FaMotorcycle />
                <span>Delivery Partner</span>
              </button>
            </div>

            {/* Form layout */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              {activeTab === 'restaurant' ? (
                /* RESTAURANT FORM */
                <form onSubmit={handleRestaurantSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Owner & Credentials</h3>
                    <p className="text-xs text-gray-400">Account login credentials for the admin dashboard</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <FaUser className="text-gray-400" />
                        <span>Owner Name *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Chef Mario"
                        value={restaurantForm.ownerName}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, ownerName: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <FaEnvelope className="text-gray-400" />
                        <span>Owner Email *</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="mario@restaurant.com"
                        value={restaurantForm.email}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, email: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <FaPhone className="text-gray-400" />
                        <span>Owner Phone *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="98765 43211"
                        value={restaurantForm.phone}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <FaLock className="text-gray-400" />
                        <span>Dashboard Password *</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={restaurantForm.password}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, password: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Restaurant Details</h3>
                    <p className="text-xs text-gray-400">Public profile details visible to ordering customers</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <FaBuilding className="text-gray-400" />
                        <span>Restaurant Name *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="La Piazza & Pizzeria"
                        value={restaurantForm.restaurantName}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, restaurantName: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Description</label>
                      <textarea
                        rows="2"
                        placeholder="Authentic Italian wood-fired pizza kitchen with artisanal sides..."
                        value={restaurantForm.description}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Cuisines (Comma Separated)</label>
                      <input
                        type="text"
                        placeholder="Italian, Pizza, Dessert"
                        value={restaurantForm.cuisine}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, cuisine: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Banner Image URL</label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={restaurantForm.bannerImage}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, bannerImage: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Delivery Fee (₹)</label>
                      <input
                        type="number"
                        placeholder="40"
                        value={restaurantForm.deliveryPrice}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, deliveryPrice: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Estimated Prep/Delivery Time</label>
                      <input
                        type="text"
                        placeholder="30-40 mins"
                        value={restaurantForm.estimatedDeliveryTime}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, estimatedDeliveryTime: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm px-8 py-3 rounded-xl shadow-md transition-all uppercase tracking-wide cursor-pointer focus:outline-none"
                    >
                      Register Restaurant Partner
                    </button>
                  </div>
                </form>
              ) : (
                /* DELIVERY DRIVER FORM */
                <form onSubmit={handleDeliverySubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Delivery Rider Application</h3>
                    <p className="text-xs text-gray-400">Onboard as a rider, earn payouts, and work flexible shifts</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <FaUser className="text-gray-400" />
                        <span>Rider Full Name *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ramesh Kumar"
                        value={deliveryForm.name}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, name: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <FaEnvelope className="text-gray-400" />
                        <span>Rider Email *</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="ramesh@bitedash.com"
                        value={deliveryForm.email}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, email: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <FaPhone className="text-gray-400" />
                        <span>Rider Phone *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="9999999999"
                        value={deliveryForm.phone}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, phone: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <FaLock className="text-gray-400" />
                        <span>Console Password *</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={deliveryForm.password}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, password: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Vehicle Type *</label>
                      <select
                        value={deliveryForm.vehicleType}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, vehicleType: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      >
                        <option value="Motorcycle">Motorcycle / Bike</option>
                        <option value="Scooter">Scooter / Electric</option>
                        <option value="Bicycle">Bicycle</option>
                      </select>
                    </div>

                    {deliveryForm.vehicleType !== 'Bicycle' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                          <FaIdCard className="text-gray-400" />
                          <span>Driving License Number *</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="DL-MH-1234567890"
                          value={deliveryForm.licenseNumber}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, licenseNumber: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span>Working City *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Mumbai"
                        value={deliveryForm.city}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, city: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm px-8 py-3 rounded-xl shadow-md transition-all uppercase tracking-wide cursor-pointer focus:outline-none"
                    >
                      Apply as Delivery Rider
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
