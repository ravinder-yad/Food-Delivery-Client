import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaStar, FaClock, FaPercentage, FaPlus, FaMinus, FaTimes, FaShoppingBag } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../../redux/slices/cartSlice';

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [banner, setBanner] = useState({
    title: 'Delicious food, delivered to your door.',
    description: 'Order from your favorite local restaurants with smart AI-driven recommendations.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Banners
        const bannersRes = await axios.get('http://localhost:5000/api/banners');
        if (bannersRes.data && bannersRes.data.length > 0) {
          setBanner(bannersRes.data[0]);
        }

        // Fetch Categories
        const categoriesRes = await axios.get('http://localhost:5000/api/categories');
        setCategories(categoriesRes.data || []);

        // Fetch Foods
        const foodsRes = await axios.get('http://localhost:5000/api/foods');
        setFoods(foodsRes.data || []);
      } catch (error) {
        console.error('Error fetching dynamic CMS data:', error);
        toast.error('Failed to load live data, showing demo placeholders.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative text-white py-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden min-h-[450px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src={banner.image}
            alt="Hero Banner"
            className="w-full h-full object-cover filter brightness-[0.4]"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl mx-auto space-y-6"
        >
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            {banner.title}
          </h1>
          <p className="text-lg sm:text-xl font-medium text-rose-50">
            {banner.description}
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mt-8 flex shadow-2xl rounded-full overflow-hidden bg-white p-2">
            <div className="flex items-center flex-grow pl-4 text-gray-400">
              <FaSearch className="text-lg" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for restaurants, cuisines, or dishes..."
                className="w-full bg-transparent border-none text-gray-800 focus:outline-none pl-3 placeholder-gray-400 text-base font-semibold"
              />
            </div>
            <button
              type="submit"
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-8 py-3 rounded-full text-base transition-all shadow-md shrink-0"
            >
              Search
            </button>
          </form>
        </motion.div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">In the mood for...?</h2>
          <button
            onClick={() => navigate('/categories')}
            className="text-rose-500 hover:text-rose-600 font-bold transition-colors text-sm uppercase tracking-wide cursor-pointer focus:outline-none"
          >
            See All Categories
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="bg-gray-200 animate-pulse h-32 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
            {categories.map((cat) => (
              <motion.div
                key={cat._id}
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate(`/restaurants?cuisine=${cat.name}`)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center cursor-pointer hover:shadow-md transition-all text-center"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-20 h-20 rounded-full object-cover mb-3 shadow-inner"
                />
                <span className="font-bold text-gray-700 text-sm">{cat.name}</span>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Dynamic Foods Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Dynamic AI Recommendations</h2>
            <p className="text-sm text-gray-500 mt-1">Fetched live from the admin database</p>
          </div>
          <button
            onClick={() => navigate('/restaurants')}
            className="text-rose-500 hover:text-rose-600 font-bold transition-colors"
          >
            See All
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-gray-200 animate-pulse h-80 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {foods.map((food, index) => (
              <motion.div
                key={food._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full cursor-pointer hover:shadow-xl transition-all"
                onClick={() => setSelectedFood(food)}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-rose-500 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center shadow-md">
                    <FaPercentage className="mr-1 text-xs" />
                    <span>{food.discount > 0 ? `${food.discount}% OFF` : 'LIVE ITEM'}</span>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-gray-800 truncate">{food.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        food.isVeg ? 'border-green-500 text-green-500 bg-green-50' : 'border-red-500 text-red-500 bg-red-50'
                      }`}>
                        {food.isVeg ? 'VEG' : 'NON-VEG'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">From: {food.restaurant?.name || 'Partner Kitchen'}</p>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{food.description}</p>
                  </div>

                  <div className="border-t border-gray-50 pt-4 flex justify-between items-center text-sm font-bold text-gray-600 mt-4">
                    <div className="flex items-center gap-2">
                      {food.discount > 0 ? (
                        <>
                          <span className="text-rose-500 font-extrabold text-base">
                            ₹{Math.round(food.price * (1 - food.discount / 100))}
                          </span>
                          <span className="text-xs text-gray-400 line-through font-semibold">
                            ₹{food.price}
                          </span>
                        </>
                      ) : (
                        <span className="text-rose-500 font-extrabold text-base">₹{food.price}</span>
                      )}
                    </div>
                    <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-0.5 rounded">
                      <FaStar className="mr-1 text-xs" />
                      <span>{food.rating || '4.5'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Food Details Modal */}
      <AnimatePresence>
        {selectedFood && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] max-w-lg w-full overflow-hidden shadow-2xl relative border border-gray-100 flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedFood(null)}
                className="absolute top-4 right-4 bg-black/55 hover:bg-black/80 text-white p-2.5 rounded-full z-10 transition-colors cursor-pointer flex items-center justify-center w-9 h-9"
              >
                <FaTimes />
              </button>

              {/* Product Image */}
              <div className="relative h-64 w-full shrink-0">
                <img
                  src={selectedFood.image}
                  alt={selectedFood.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border uppercase tracking-wider ${
                      selectedFood.isVeg ? 'border-green-400 text-green-400 bg-green-950/40' : 'border-red-400 text-red-400 bg-red-950/40'
                    }`}>
                      {selectedFood.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                    </span>
                    {selectedFood.discount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {selectedFood.discount}% OFF
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black mt-2 leading-tight">{selectedFood.name}</h3>
                  <p className="text-xs text-gray-300 font-semibold mt-1">
                    By: {selectedFood.restaurant?.name || 'Partner Kitchen'}
                  </p>
                </div>
              </div>

              {/* Scrollable details */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-sm font-semibold text-gray-700">
                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Description</h4>
                  <p className="text-gray-500 leading-relaxed text-base font-medium">
                    {selectedFood.description || 'No description available for this delicious item.'}
                  </p>
                </div>

                {/* Rating & Prep details */}
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="text-center flex-1 border-r border-gray-200/50">
                    <span className="block text-[10px] font-black text-gray-400 uppercase">Rating</span>
                    <span className="text-lg font-black text-gray-800 flex items-center justify-center gap-1 mt-0.5">
                      <FaStar className="text-amber-500 text-sm" />
                      <span>{selectedFood.rating || '4.5'}</span>
                    </span>
                  </div>
                  <div className="text-center flex-1">
                    <span className="block text-[10px] font-black text-gray-400 uppercase">Preparation</span>
                    <span className="text-lg font-black text-gray-800 flex items-center justify-center gap-1 mt-0.5">
                      <FaClock className="text-rose-500 text-sm" />
                      <span>15-20 Mins</span>
                    </span>
                  </div>
                </div>

                {/* Pricing & Add to Cart Section */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Total Price</span>
                    <div className="flex items-baseline gap-2">
                      {selectedFood.discount > 0 ? (
                        <>
                          <span className="text-2xl font-black text-rose-500">
                            ₹{Math.round(selectedFood.price * (1 - selectedFood.discount / 100))}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            ₹{selectedFood.price}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-black text-rose-500">₹{selectedFood.price}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Actions */}
                  <div>
                    {(() => {
                      const qty = cart.items.find(item => item._id === selectedFood._id)?.quantity || 0;
                      return qty > 0 ? (
                        <div className="flex items-center bg-rose-500 text-white rounded-full p-1.5 shadow-md">
                          <button
                            onClick={() => {
                              dispatch(removeFromCart(selectedFood._id));
                              toast.success('Removed from cart');
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer flex items-center justify-center"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="font-bold px-4 text-base">{qty}</span>
                          <button
                            onClick={() => {
                              const finalPrice = selectedFood.discount > 0 ? Math.round(selectedFood.price * (1 - selectedFood.discount / 100)) : selectedFood.price;
                              dispatch(addToCart({
                                food: { ...selectedFood, price: finalPrice },
                                restaurant: selectedFood.restaurant || { _id: 'res1', name: 'Partner Kitchen' }
                              }));
                              toast.success('Added to cart');
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer flex items-center justify-center"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const finalPrice = selectedFood.discount > 0 ? Math.round(selectedFood.price * (1 - selectedFood.discount / 100)) : selectedFood.price;
                            dispatch(addToCart({
                              food: { ...selectedFood, price: finalPrice },
                              restaurant: selectedFood.restaurant || { _id: 'res1', name: 'Partner Kitchen' }
                            }));
                            toast.success(`${selectedFood.name} added to cart!`);
                          }}
                          className="bg-rose-500 hover:bg-rose-600 text-white font-black px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer text-sm"
                        >
                          <FaShoppingBag />
                          <span>Add to Cart</span>
                        </button>
                      );
                    })()}
                  </div>
                </div>

                {/* Go to Restaurant Link */}
                {selectedFood.restaurant && (
                  <button
                    onClick={() => {
                      setSelectedFood(null);
                      navigate(`/restaurants/${selectedFood.restaurant._id}`);
                    }}
                    className="w-full text-center py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-bold transition-all text-xs cursor-pointer border border-gray-200/50"
                  >
                    View Restaurant Full Menu & Details
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
