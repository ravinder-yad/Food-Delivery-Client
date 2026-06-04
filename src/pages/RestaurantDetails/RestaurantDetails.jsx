import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaStar, FaClock, FaPlus, FaMinus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { addToCart, removeFromCart } from '../../redux/slices/cartSlice';

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [foods, setFoods] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  const cart = useSelector((state) => state.cart);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/foods');
        const allFoods = res.data || [];
        const restaurantFoods = allFoods.filter((f) => f.restaurant?._id === id || f.restaurant === id);

        setFoods(restaurantFoods);

        if (restaurantFoods.length > 0) {
          setRestaurant(restaurantFoods[0].restaurant);
        } else {
          // Fallback if no foods found for this ID
          setRestaurant({
            _id: id,
            name: 'La Piazza & Pizzeria',
            description: 'Authentic stone-baked Italian pizzas and fresh pastas.',
            bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
            rating: 4.8,
            estimatedDeliveryTime: '30 mins',
            deliveryPrice: 40,
            cuisine: ['Italian', 'Pizza']
          });
        }
      } catch (error) {
        console.error('Error fetching restaurant menu:', error);
        toast.error('Failed to load menu items.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id]);

  const getItemQuantity = (foodId) => {
    if (cart.restaurant?._id !== id) return 0;
    const item = cart.items.find((item) => item._id === foodId);
    return item ? item.quantity : 0;
  };

  const handleAddFood = (food) => {
    const finalPrice = food.discount > 0 ? Math.round(food.price * (1 - food.discount / 100)) : food.price;
    const foodWithDiscountedPrice = {
      ...food,
      price: finalPrice
    };
    dispatch(addToCart({ food: foodWithDiscountedPrice, restaurant }));
    toast.success(`${food.name} added to cart`);
  };

  const handleRemoveFood = (foodId) => {
    dispatch(removeFromCart(foodId));
    toast.success('Removed from cart');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500 font-bold mt-4">Loading Restaurant Menu...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Restaurant Header Banner */}
      <div className="relative h-64 sm:h-96 w-full overflow-hidden">
        <img
          src={restaurant?.bannerImage}
          alt={restaurant?.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              {restaurant?.cuisine?.map((c) => (
                <span key={c} className="bg-white/20 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-bold">
                  {c}
                </span>
              ))}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black">{restaurant?.name}</h1>
            <p className="text-gray-300 text-sm sm:text-base mt-2 max-w-2xl">{restaurant?.description}</p>
          </div>

          <div className="flex items-center space-x-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
              <div className="flex items-center justify-center text-amber-400 font-bold text-lg">
                <FaStar className="mr-1" />
                <span>{restaurant?.rating || '4.5'}</span>
              </div>
              <span className="text-xs text-gray-300">Reviews Rating</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
              <div className="flex items-center justify-center text-white font-bold text-lg">
                <FaClock className="mr-1 text-sm" />
                <span>{restaurant?.estimatedDeliveryTime || '30 mins'}</span>
              </div>
              <span className="text-xs text-gray-300">Delivery Speed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Items */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-4">Recommended Dishes</h2>
          <div className="space-y-4">
            {foods.map((food) => {
              const qty = getItemQuantity(food._id);
              return (
                <div
                  key={food._id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex gap-6 items-center hover:shadow-md transition-all"
                >
                  <div className="relative h-24 w-24 sm:h-32 sm:w-32 shrink-0 rounded-2xl overflow-hidden shadow-md">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center shrink-0 ${
                        food.isVeg ? 'border-green-500' : 'border-red-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          food.isVeg ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </span>
                      <h3 className="font-bold text-gray-800 text-lg sm:text-xl truncate">{food.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {food.discount > 0 ? (
                        <>
                          <span className="text-lg font-black text-rose-500">
                            ₹{Math.round(food.price * (1 - food.discount / 100))}
                          </span>
                          <span className="text-xs text-gray-400 line-through font-semibold">
                            ₹{food.price}
                          </span>
                          <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold border border-green-200">
                            {food.discount}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-black text-rose-500">₹{food.price}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{food.description}</p>
                  </div>

                  <div className="shrink-0 flex flex-col items-center">
                    {qty > 0 ? (
                      <div className="flex items-center bg-rose-500 text-white rounded-full p-1.5 shadow-md">
                        <button
                          onClick={() => handleRemoveFood(food._id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors"
                        >
                          <FaMinus className="text-xs" />
                        </button>
                        <span className="font-bold px-3 text-sm">{qty}</span>
                        <button
                          onClick={() => handleAddFood(food)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors"
                        >
                          <FaPlus className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddFood(food)}
                        className="bg-white hover:bg-rose-50 border border-gray-200 text-rose-500 font-bold px-5 py-2 rounded-full shadow-sm hover:shadow-md transition-all flex items-center space-x-1"
                      >
                        <FaPlus className="text-xs" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Small floating cart preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Cart Summary</h3>
            {cart.restaurant?._id === id && cart.items.length > 0 ? (
              <div className="space-y-4">
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex justify-between items-center text-sm text-gray-600">
                      <span className="truncate max-w-[150px]">{item.name} x {item.quantity}</span>
                      <span className="font-semibold text-gray-800">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-gray-800">
                  <span>Subtotal</span>
                  <span className="text-rose-500">₹{cart.totalAmount}</span>
                </div>
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl shadow-md transition-all text-center block"
                >
                  View Full Cart
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">Your cart is empty or has items from another restaurant.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
