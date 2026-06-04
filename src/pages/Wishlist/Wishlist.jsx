import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaStar, FaClock } from 'react-icons/fa';
import { RESTAURANTS } from '../../constants/mockData.js';

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([RESTAURANTS[0]]);

  const handleRemove = (id, e) => {
    e.stopPropagation();
    setWishlist(wishlist.filter((r) => r._id !== id));
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center gap-3">
          <FaHeart className="text-rose-500" />
          <span>My Wishlist</span>
        </h1>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {wishlist.map((res) => (
              <div
                key={res._id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col cursor-pointer hover:shadow-md transition-all relative"
                onClick={() => navigate(`/restaurants/${res._id}`)}
              >
                <button
                  onClick={(e) => handleRemove(res._id, e)}
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white text-rose-500 hover:text-rose-600 p-2.5 rounded-full backdrop-blur-md shadow-md transition-colors"
                >
                  <FaHeart />
                </button>

                <div className="h-40 w-full overflow-hidden">
                  <img src={res.bannerImage} alt={res.name} className="w-full h-full object-cover" />
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{res.name}</h3>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-1">{res.description}</p>
                  
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-500 pt-3 border-t border-gray-50">
                    <div className="flex items-center text-amber-500">
                      <FaStar className="mr-1" />
                      <span>{res.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-1" />
                      <span>{res.estimatedDeliveryTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <p className="text-lg text-gray-400 font-semibold">Your wishlist is empty.</p>
            <button
              onClick={() => navigate('/restaurants')}
              className="mt-6 bg-rose-500 text-white font-bold px-6 py-2.5 rounded-full shadow-md hover:bg-rose-600 transition-colors"
            >
              Explore Restaurants
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
