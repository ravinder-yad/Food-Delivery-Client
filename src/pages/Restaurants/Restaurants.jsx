import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaStar, FaClock, FaFilter } from 'react-icons/fa';
import { RESTAURANTS } from '../../constants/mockData.js';

export default function Restaurants() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCuisine = searchParams.get('cuisine') || '';

  const [restaurants, setRestaurants] = useState(RESTAURANTS);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCuisine, setSelectedCuisine] = useState(initialCuisine);
  const [sortBy, setSortBy] = useState('rating');

  const cuisinesList = ['All', 'Italian', 'Pizza', 'Burgers', 'American', 'Mughlai', 'Biryani', 'North Indian'];

  // Sync state with URL search parameters
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setSelectedCuisine(searchParams.get('cuisine') || '');
  }, [searchParams]);

  useEffect(() => {
    let filtered = RESTAURANTS.filter((res) => {
      const matchesSearch =
        res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.cuisine.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCuisine =
        !selectedCuisine ||
        selectedCuisine === 'All' ||
        res.cuisine.some((c) => c.toLowerCase() === selectedCuisine.toLowerCase());

      return matchesSearch && matchesCuisine;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'deliveryPrice') return a.deliveryPrice - b.deliveryPrice;
      const getMins = (str) => parseInt(str.split('-')[0]) || 0;
      if (sortBy === 'deliveryTime') return getMins(a.estimatedDeliveryTime) - getMins(b.estimatedDeliveryTime);
      return 0;
    });

    setRestaurants(filtered);
  }, [searchQuery, selectedCuisine, sortBy]);

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Explore Restaurants</h1>

        {/* Filters Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Input */}
            <div className="flex-grow max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurant or cuisine..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-3">
              <FaFilter className="text-gray-400 text-sm" />
              <span className="text-sm font-semibold text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              >
                <option value="rating">Rating: High to Low</option>
                <option value="deliveryTime">Delivery Time: Fastest</option>
                <option value="deliveryPrice">Delivery Fee: Lowest</option>
              </select>
            </div>
          </div>

          {/* Cuisine quick pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {cuisinesList.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCuisine(c === 'All' ? '' : c)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  (selectedCuisine === c || (c === 'All' && !selectedCuisine))
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurants Grid */}
        {restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {restaurants.map((res) => (
              <div
                key={res._id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                onClick={() => navigate(`/restaurants/${res._id}`)}
              >
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={res.bannerImage}
                    alt={res.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{res.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{res.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {res.cuisine.map((c) => (
                        <span key={c} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-semibold">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-gray-50 pt-4 flex justify-between items-center text-sm font-semibold text-gray-600">
                    <div className="flex items-center text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg">
                      <FaStar className="mr-1" />
                      <span>{res.rating}</span>
                    </div>
                    <div className="flex items-center text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                      <FaClock className="mr-1 text-xs" />
                      <span>{res.estimatedDeliveryTime}</span>
                    </div>
                    <div className="text-rose-500 font-bold bg-rose-50 px-2.5 py-1 rounded-lg">
                      ₹{res.deliveryPrice} Delivery
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <p className="text-lg text-gray-400 font-semibold">No restaurants found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
