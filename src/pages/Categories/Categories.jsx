import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronRight, FaUtensils, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories from backend:', err);
        setError('Failed to fetch categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Back navigation & Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-xs font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest mb-4 transition-colors focus:outline-none"
            >
              <FaArrowLeft className="text-[10px]" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
              <FaUtensils className="text-rose-500" />
              <span>Explore Cuisines & Categories</span>
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-2">
              Browse through our delicious curated selection of meals and filter items instantly.
            </p>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-4 animate-pulse">
                <div className="w-full h-36 bg-gray-200 rounded-2xl"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4">
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

        {/* Categories Grid List */}
        {!loading && !error && categories.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {categories.map((category) => (
              <motion.div
                key={category._id}
                variants={itemVariants}
                onClick={() => navigate(`/restaurants?cuisine=${encodeURIComponent(category.name)}`)}
                className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image Container with zoom */}
                  <div className="relative overflow-hidden h-40 bg-rose-50">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    <span className="absolute bottom-3 left-4 text-xs font-black bg-rose-500 text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {category.name}
                    </span>
                  </div>

                  {/* Body Details */}
                  <div className="p-5">
                    <h3 className="font-extrabold text-lg text-gray-800 group-hover:text-rose-500 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-semibold mt-1.5 line-clamp-2">
                      {category.description || 'Delectable preparations made fresh daily by our kitchen partners.'}
                    </p>
                  </div>
                </div>

                {/* Footer Action Indicator */}
                <div className="px-5 pb-5 pt-1 flex justify-between items-center text-xs font-bold text-rose-500 border-t border-gray-50 mt-2">
                  <span>Explore Menu</span>
                  <div className="w-6 h-6 rounded-full bg-rose-50 group-hover:bg-rose-500 group-hover:text-white flex items-center justify-center transition-colors">
                    <FaChevronRight className="text-[8px]" />
                  </div>
                </div>

              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-lg text-gray-400 font-semibold">No food categories listed yet.</p>
          </div>
        )}

      </div>
    </div>
  );
}
