import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FaShoppingCart, FaHeart, FaUser, FaSignOutAlt, FaBell, FaSearch,
  FaMapMarkerAlt, FaChevronDown, FaGift, FaTimes,
  FaCheckCircle, FaMotorcycle, FaUtensils, FaWallet, FaTicketAlt, FaQuestionCircle
} from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice';
import { clearCart } from '../../redux/slices/cartSlice';

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items, totalAmount } = useSelector((state) => state.cart);

  // States for interactive dropdowns
  const [activeDropdown, setActiveDropdown] = useState(null); // 'categories', 'offers', 'location', 'search', 'notifications', 'cart', 'profile'
  const [selectedLocation, setSelectedLocation] = useState(
    localStorage.getItem('userLiveLocation') || 'Detecting Location...'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [dbCategories, setDbCategories] = useState([]);
  const [dbOffers, setDbOffers] = useState([]);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoWidth, setLogoWidth] = useState(100);
  const [logoShape, setLogoShape] = useState('round');

  // Dropdown refs to detect outside clicks
  const navRef = useRef(null);

  const detectLiveLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data && data.address) {
              const addressInfo = data.address;
              const placeName = addressInfo.suburb || addressInfo.neighbourhood || addressInfo.road || addressInfo.city_district || '';
              const city = addressInfo.city || addressInfo.town || addressInfo.state || '';
              const formattedLoc = placeName ? `${placeName}, ${city}` : city || 'Live GPS Position';
              
              setSelectedLocation(formattedLoc);
              localStorage.setItem('userLiveLocation', formattedLoc);
              localStorage.setItem('userLiveCoords', JSON.stringify({ lat: latitude, lng: longitude }));
              
              // Custom event to sync other pages
              window.dispatchEvent(new Event('locationChanged'));
              toast.success(`Location updated: ${formattedLoc}`);
            }
          } catch (error) {
            console.error("OSM Reverse Geocoding Error:", error);
            const fallbackLoc = `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setSelectedLocation(fallbackLoc);
            localStorage.setItem('userLiveLocation', fallbackLoc);
            window.dispatchEvent(new Event('locationChanged'));
          }
        },
        (error) => {
          console.warn("Geolocation permission denied or timed out.");
          if (!localStorage.getItem('userLiveLocation')) {
            setSelectedLocation('Mumbai, India');
            localStorage.setItem('userLiveLocation', 'Mumbai, India');
          }
        }
      );
    }
  };

  useEffect(() => {
    // If not set yet, trigger auto detection
    if (!localStorage.getItem('userLiveLocation') || localStorage.getItem('userLiveLocation') === 'Detecting Location...') {
      detectLiveLocation();
    }

    // Listen to location sync events
    const syncLocation = () => {
      setSelectedLocation(localStorage.getItem('userLiveLocation') || 'Mumbai');
    };
    window.addEventListener('locationChanged', syncLocation);

    const loadCategoriesAndOffers = async () => {
      try {
        const resCat = await fetch('http://localhost:5000/api/categories');
        const dataCat = await resCat.json();
        if (Array.isArray(dataCat)) {
          setDbCategories(dataCat);
        }
      } catch (e) {
        console.warn("Could not load categories from backend:", e);
      }

      try {
        const resOff = await fetch('http://localhost:5000/api/offers');
        const dataOff = await resOff.json();
        if (Array.isArray(dataOff)) {
          setDbOffers(dataOff);
        }
      } catch (e) {
        console.warn("Could not load offers from backend:", e);
      }

      try {
        const resSettings = await fetch('http://localhost:5000/api/settings');
        const dataSettings = await resSettings.json();
        const settingsData = Array.isArray(dataSettings) ? dataSettings[0] : dataSettings;
        if (settingsData && settingsData.logo) {
          setLogoUrl(settingsData.logo);
          setLogoWidth(settingsData.logoWidth || 100);
          setLogoShape(settingsData.logoShape || 'round');
        }
      } catch (e) {
        console.warn("Could not load brand settings logo in navbar:", e);
      }
    };
    loadCategoriesAndOffers();

    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('locationChanged', syncLocation);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleLogout = () => {
    dispatch(logout());
    setActiveDropdown(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
      setActiveDropdown(null);
    }
  };

  const categoriesList = dbCategories.length > 0 ? dbCategories : [
    { name: 'Pizza', emoji: '🍕', fallback: true },
    { name: 'Burger', emoji: '🍔', fallback: true },
    { name: 'Biryani', emoji: '🍛', fallback: true },
    { name: 'Chinese', emoji: '🍜', fallback: true },
    { name: 'Desserts', emoji: '🍰', fallback: true },
    { name: 'Beverages', emoji: '🥤', fallback: true }
  ];

  const offersList = dbOffers.length > 0 ? dbOffers.map(o => ({
    title: o.name,
    desc: `Use coupon code ${o.couponCode}`,
    badge: o.discount
  })) : [
    { title: '50% OFF on first order', desc: 'Use code WELCOME50', badge: '50% OFF' },
    { title: 'Free Delivery above ₹199', desc: 'Auto-applied on checkout', badge: 'FREE DEL' }
  ];

  const notifications = [
    { title: 'Order Confirmed', time: '5m ago', desc: 'Your order at La Piazza has been accepted.', icon: FaCheckCircle, color: 'text-green-500 bg-green-50' },
    { title: 'Food Preparing', time: '10m ago', desc: 'Chef is preparing your meal.', icon: FaUtensils, color: 'text-amber-500 bg-amber-50' },
    { title: 'Rider Assigned', time: '15m ago', desc: 'Rider Ramesh is assigned to your delivery.', icon: FaMotorcycle, color: 'text-rose-500 bg-rose-50' }
  ];

  const recentSearches = ['Paneer Pizza', 'Biryani', 'Burger'];
  const trendingSearches = ["Pizza Hut", "Domino's", "KFC"];

  const locations = [
    { name: 'Current Location', desc: 'Detect using GPS', type: 'gps' },
    { name: 'Home', desc: '123, Green Avenue, Mumbai', type: 'address' },
    { name: 'Office', desc: '456, Business Hub, Bandra East', type: 'address' }
  ];

  const cartCount = items.reduce((total, item) => total + Number(item.quantity || 0), 0);

  return (
    <div ref={navRef} className="relative z-50">
      {/* Main Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
        
        {/* Row 1: Logo, Location, Search, Actions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-50">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Logo & Location */}
            <div className="flex items-center space-x-4 shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="object-contain"
                    style={{
                      height: '36px',
                      width: 'auto',
                      borderRadius: logoShape === 'round' ? '9999px' : logoShape === 'square' ? '8px' : '0px'
                    }}
                  />
                ) : (
                  <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-1.5">
                    <span className="text-3xl">🛵</span> QuickBite
                  </span>
                )}
              </Link>
              
              {/* Location Selector */}
              <div className="relative flex items-center">
                <button
                  onClick={() => toggleDropdown('location')}
                  className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200/50 transition-all cursor-pointer"
                >
                  <FaMapMarkerAlt className="text-rose-500 shrink-0 text-xs" />
                  <span className="max-w-[100px] truncate">{selectedLocation}</span>
                  <FaChevronDown className={`text-[8px] text-gray-400 transition-transform ${activeDropdown === 'location' ? 'rotate-180' : ''}`} />
                </button>

                {/* Location Dropdown */}
                <AnimatePresence>
                  {activeDropdown === 'location' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute left-0 top-10 w-72 bg-white rounded-3xl p-5 shadow-xl border border-gray-100 space-y-4"
                    >
                      <h3 className="text-sm font-bold text-gray-800">Select Location</h3>
                      <div className="space-y-2">
                        {locations.map((loc, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (loc.type !== 'gps') {
                                setSelectedLocation(`${loc.name}, Mumbai`);
                                localStorage.setItem('userLiveLocation', `${loc.name}, Mumbai`);
                                window.dispatchEvent(new Event('locationChanged'));
                                toast.success(`Location set to ${loc.name}`);
                              } else {
                                detectLiveLocation();
                              }
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left p-3 hover:bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3 transition-colors"
                          >
                            <span className="text-lg mt-0.5">{loc.type === 'gps' ? '🎯' : '📍'}</span>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{loc.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{loc.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          setActiveDropdown(null);
                          toast('Map modal address selector opened (Demo)');
                        }}
                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold text-xs py-2.5 rounded-xl transition-all"
                      >
                        + Add New Address
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Search Bar Input (Desktop) */}
            <div className="relative flex-grow max-w-md mx-4 hidden md:flex items-center">
              <form onSubmit={handleSearchSubmit} className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-rose-500 focus-within:bg-white transition-all w-full">
                <FaSearch className="text-gray-400 text-xs shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => toggleDropdown('search')}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search restaurants, cuisines or dishes..."
                  className="w-full bg-transparent border-none text-xs text-gray-800 pl-2 focus:outline-none placeholder-gray-400 font-semibold"
                />
              </form>

              {/* Search Dropdown Overlay */}
              <AnimatePresence>
                {activeDropdown === 'search' && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute left-0 top-11 w-80 bg-white rounded-3xl p-5 shadow-xl border border-gray-100 space-y-4"
                  >
                    <div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Recent Searches</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((rec) => (
                          <button
                            key={rec}
                            onClick={() => {
                              setSearchQuery(rec);
                              navigate(`/restaurants?search=${encodeURIComponent(rec)}`);
                              setActiveDropdown(null);
                            }}
                            className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-100 font-bold transition-all"
                          >
                            {rec}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-50 pt-3">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Trending Brands</h4>
                      <ul className="space-y-1.5 text-xs font-bold text-gray-600">
                        {trendingSearches.map((tr) => (
                          <li key={tr}>
                            <button
                              onClick={() => {
                                setSearchQuery(tr);
                                navigate(`/restaurants?search=${encodeURIComponent(tr)}`);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left hover:text-rose-500 flex items-center justify-between"
                            >
                              <span>🔥 {tr}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions: Wishlist, Notification, Cart, Profile */}
            <div className="flex items-center space-x-4">
              {/* Wishlist */}
              <Link to="/wishlist" className="relative text-gray-600 hover:text-rose-500 transition-colors hidden md:block" title="Wishlist">
                <FaHeart className="text-lg" />
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('notifications')}
                  className="relative text-gray-600 hover:text-rose-500 transition-colors p-1"
                  title="Notifications"
                >
                  <FaBell className="text-lg" />
                  <span className="absolute top-0 right-0 bg-rose-500 w-2 h-2 rounded-full ring-2 ring-white"></span>
                </button>
                <AnimatePresence>
                  {activeDropdown === 'notifications' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute right-0 top-10 w-80 bg-white rounded-3xl p-5 shadow-xl border border-gray-100 space-y-4"
                    >
                      <h3 className="text-sm font-bold text-gray-800">Alert Notifications</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {notifications.map((not, idx) => {
                          const Icon = not.icon;
                          return (
                            <div key={idx} className="flex gap-3 text-xs border-b border-gray-50 pb-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${not.color}`}>
                                <Icon className="text-sm" />
                              </div>
                              <div>
                                <div className="flex justify-between font-bold text-gray-800">
                                  <span>{not.title}</span>
                                  <span className="text-[10px] text-gray-400 font-medium">{not.time}</span>
                                </div>
                                <p className="text-gray-500 mt-0.5">{not.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('cart')}
                  className="relative text-gray-600 hover:text-rose-500 transition-colors p-1"
                  title="Cart"
                >
                  <FaShoppingCart className="text-lg" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {activeDropdown === 'cart' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute right-0 top-10 w-80 bg-white rounded-3xl p-5 shadow-xl border border-gray-100 space-y-4"
                    >
                      <h3 className="text-sm font-bold text-gray-800">Cart Preview</h3>
                      {items.length > 0 ? (
                        <>
                          <div className="max-h-48 overflow-y-auto space-y-3">
                            {items.map((item) => (
                              <div key={item._id} className="flex items-center gap-3 text-xs justify-between border-b border-gray-50 pb-2">
                                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                <div className="flex-grow min-w-0">
                                  <h4 className="font-bold text-gray-800 truncate">{item.name}</h4>
                                  <p className="text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                                </div>
                                <span className="font-bold text-gray-800">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-sm text-gray-800">
                            <span>Subtotal</span>
                            <span className="text-rose-500">₹{totalAmount}</span>
                          </div>
                          <button
                            onClick={() => {
                              setActiveDropdown(null);
                              navigate('/cart');
                            }}
                            className="w-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all text-center"
                          >
                            Checkout Now
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-4">Your cart is empty.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Dropdown or Login buttons */}
              <div className="relative">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => toggleDropdown('profile')}
                      className="flex items-center space-x-1 text-gray-700 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center font-bold text-sm shadow-inner">
                        {user.name.charAt(0)}
                      </div>
                      <FaChevronDown className="text-[9px] text-gray-400" />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === 'profile' && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          className="absolute right-0 top-10 w-64 bg-white rounded-3xl p-4 shadow-xl border border-gray-100 flex flex-col gap-1 text-sm text-gray-700 font-semibold"
                        >
                          <div className="px-3 py-2 border-b border-gray-50 mb-2">
                            <p className="text-sm font-bold text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                          </div>
                          
                          <Link to="/profile" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                            <FaUser className="text-gray-400" /> My Profile
                          </Link>
                          <Link to="/orders" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                            <FaShoppingCart className="text-gray-400" /> My Orders
                          </Link>
                          <Link to="/profile" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                            <FaMapMarkerAlt className="text-gray-400" /> Saved Addresses
                          </Link>
                          <Link to="/wallet" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                            <FaWallet className="text-gray-400" /> Wallet
                          </Link>
                          <button
                            onClick={() => {
                              setActiveDropdown(null);
                              toast('Available Coupons: BiteDash50, FREEDEL');
                            }}
                            className="w-full text-left flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors font-semibold"
                          >
                            <FaTicketAlt className="text-gray-400" /> Coupons
                          </button>
                          <a href="#" className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                            <FaQuestionCircle className="text-gray-400" /> Help Center
                          </a>
                          
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 p-2.5 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors mt-2 border-t border-gray-50 pt-2 font-bold"
                          >
                            <FaSignOutAlt /> Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="flex items-center space-x-3.5 whitespace-nowrap">
                    <Link to="/login" className="text-gray-700 hover:text-rose-500 text-xs font-bold transition-colors whitespace-nowrap">Log in</Link>
                    <Link to="/register" className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap">Sign up</Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Row 2: Secondary Menu Links (Desktop) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 hidden md:block">
          <div className="flex h-11 items-center space-x-8 text-xs font-bold text-gray-500">
            <Link to="/" className="hover:text-rose-500 transition-colors">Home</Link>
            <Link to="/restaurants" className="hover:text-rose-500 transition-colors">Restaurants</Link>
            
            {/* Categories Mega Trigger */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('categories')}
                className="flex items-center space-x-1 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <span>Categories</span>
                <FaChevronDown className="text-[8px] mt-0.5 text-gray-400" />
              </button>
              <AnimatePresence>
                {activeDropdown === 'categories' && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute left-0 top-8 w-96 bg-white rounded-3xl p-5 shadow-xl border border-gray-100 grid grid-cols-2 gap-3"
                  >
                    {categoriesList.slice(0, 8).map((cat, idx) => (
                      <Link
                        key={cat._id || idx}
                        to={`/restaurants?cuisine=${encodeURIComponent(cat.name)}`}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        {cat.fallback ? (
                          <span className="text-xl">{cat.emoji}</span>
                        ) : (
                          <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-gray-700">{cat.name}</span>
                      </Link>
                    ))}
                    <div className="col-span-2 border-t border-gray-50 pt-2.5 mt-1">
                      <Link
                        to="/categories"
                        onClick={() => setActiveDropdown(null)}
                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold text-xs py-2 rounded-xl transition-all text-center block"
                      >
                        See All Categories
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Offers Trigger */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('offers')}
                className="flex items-center space-x-1 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <span>Offers</span>
                <FaChevronDown className="text-[8px] mt-0.5 text-gray-400" />
              </button>
              <AnimatePresence>
                {activeDropdown === 'offers' && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute left-0 top-8 w-80 bg-white rounded-3xl p-5 shadow-xl border border-gray-100 space-y-4"
                  >
                    <h3 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                      <FaGift className="text-rose-500" /> Hot Offers
                    </h3>
                    <div className="space-y-2">
                      {offersList.slice(0, 3).map((off, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-200/50 flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">{off.badge}</span>
                          </div>
                          <h4 className="text-xs font-bold text-gray-800 mt-1">{off.title}</h4>
                          <p className="text-[10px] text-gray-400">{off.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-50 pt-2.5 mt-2">
                      <Link
                        to="/offers"
                        onClick={() => setActiveDropdown(null)}
                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold text-xs py-2 rounded-xl transition-all text-center block"
                      >
                        See All Offers
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/restaurants?filter=near" className="hover:text-rose-500 transition-colors">Near Me</Link>
            <Link to="/orders" className="hover:text-rose-500 transition-colors">Track Order</Link>

            {/* Become Partner Trigger */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('partner')}
                className="flex items-center space-x-1 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <span>Become Partner</span>
                <FaChevronDown className="text-[8px] mt-0.5 text-gray-400" />
              </button>
              <AnimatePresence>
                {activeDropdown === 'partner' && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute left-0 top-8 w-60 bg-white rounded-3xl p-4 shadow-xl border border-gray-100 flex flex-col gap-2"
                  >
                    <Link
                      to="/become-partner?role=restaurant"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-2xl border border-gray-100 font-semibold text-gray-700 text-xs"
                    >
                      <span className="text-lg">🏪</span> Restaurant Partner
                    </Link>
                    <Link
                      to="/become-partner?role=delivery"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-2xl border border-gray-100 font-semibold text-gray-700 text-xs"
                    >
                      <span className="text-lg">🚴</span> Delivery Partner
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </nav>

      {/* Mobile Bottom Navigation (Visible only on mobile views) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] flex justify-around items-center py-3 z-50 md:hidden">
        <Link to="/" className="flex flex-col items-center gap-1 text-gray-500 hover:text-rose-500 transition-colors">
          <span className="text-lg">🏠</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link to="/restaurants" className="flex flex-col items-center gap-1 text-gray-500 hover:text-rose-500 transition-colors">
          <span className="text-lg">🔍</span>
          <span className="text-[10px] font-bold">Search</span>
        </Link>
        <Link to="/orders" className="flex flex-col items-center gap-1 text-gray-500 hover:text-rose-500 transition-colors">
          <span className="text-lg">🍛</span>
          <span className="text-[10px] font-bold">Orders</span>
        </Link>
        <Link to="/cart" className="flex flex-col items-center gap-1 text-gray-500 hover:text-rose-500 transition-colors relative">
          <span className="text-lg">🛒</span>
          <span className="text-[10px] font-bold">Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </Link>
        <Link to="/profile" className="flex flex-col items-center gap-1 text-gray-500 hover:text-rose-500 transition-colors">
          <span className="text-lg">👤</span>
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </div>
    </div>
  );
}
