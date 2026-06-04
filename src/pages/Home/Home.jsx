import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaStar, FaClock, FaPercentage } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
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
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-8">In the mood for...?</h2>
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
                onClick={() => navigate(`/restaurants/${food.restaurant?._id || 'res1'}`)}
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
    </div>
  );
}
