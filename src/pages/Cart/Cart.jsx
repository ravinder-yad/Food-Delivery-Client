import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { addToCart, removeFromCart, clearCart } from '../../redux/slices/cartSlice';

export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleAdd = (item) => {
    dispatch(addToCart({ food: item, restaurant: cart.restaurant }));
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
          <p className="text-sm text-gray-400 mt-2">Add some items from our menu to start your order!</p>
          <button
            onClick={() => navigate('/restaurants')}
            className="mt-6 bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-2.5 rounded-full shadow-md transition-all"
          >
            Find Restaurants
          </button>
        </div>
      </div>
    );
  }

  const deliveryPrice = cart.restaurant?.deliveryPrice || 0;
  const taxPrice = Math.round(cart.totalAmount * 0.05); // 5% GST
  const grandTotal = cart.totalAmount + deliveryPrice + taxPrice;

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{cart.restaurant?.name}</h2>
                  <p className="text-xs text-gray-400">Ordering from here</p>
                </div>
                <button
                  onClick={() => dispatch(clearCart())}
                  className="text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  Clear Cart
                </button>
              </div>

              <div className="space-y-6">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                      <div>
                        <h3 className="font-bold text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500">₹{item.price}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          <FaMinus className="text-xs text-gray-600" />
                        </button>
                        <span className="font-bold px-3 text-sm text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => handleAdd(item)}
                          className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          <FaPlus className="text-xs text-rose-500" />
                        </button>
                      </div>

                      <span className="font-bold text-gray-800 w-16 text-right">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Checkout summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">Bill Details</h3>
              <div className="space-y-3 text-sm font-semibold text-gray-600">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="text-gray-800">₹{cart.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-gray-800">₹{deliveryPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Charges (GST)</span>
                  <span className="text-gray-800">₹{taxPrice}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base text-gray-800">
                  <span>Grand Total</span>
                  <span className="text-rose-500 text-lg">₹{grandTotal}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-center block"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
