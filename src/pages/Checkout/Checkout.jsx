import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { clearCart } from '../../redux/slices/cartSlice';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [address, setAddress] = useState({
    line1: '123, Green Avenue',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  const deliveryPrice = cart.restaurant?.deliveryPrice || 0;
  const taxPrice = Math.round(cart.totalAmount * 0.05);
  const grandTotal = cart.totalAmount + deliveryPrice + taxPrice;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock references since we don't enforce full database ID links for user/address in demo
      const orderData = {
        user: user?._id || '60d014000000000000000009', // Fallback ObjectId format
        restaurant: cart.restaurant?._id || '60d014000000000000000001',
        items: cart.items.map(item => ({
          food: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        deliveryAddress: '60d014000000000000000002', // Fallback address ObjectId
        totalAmount: grandTotal,
        deliveryPrice,
        taxPrice,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed'
      };

      const res = await axios.post('http://localhost:5000/api/orders', orderData);
      const placedOrder = res.data;

      // Save order in localStorage too for history display
      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      localStorage.setItem('orders', JSON.stringify([
        { ...placedOrder, restaurantName: cart.restaurant?.name || 'QuickBite Partner' },
        ...orders
      ]));

      dispatch(clearCart());
      toast.success('Order placed successfully in Database!');
      navigate(`/tracking/${placedOrder._id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to save order on Server. Using offline simulation...');
      
      // Offline fallback so the client flows perfectly anyway!
      const mockOrderId = `ord_${Math.floor(100000 + Math.random() * 900000)}`;
      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      const newOrder = {
        _id: mockOrderId,
        restaurantName: cart.restaurant?.name || 'QuickBite Partner',
        items: cart.items,
        totalAmount: grandTotal,
        orderStatus: 'Placed',
        createdAt: new Date().toISOString(),
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed',
      };
      localStorage.setItem('orders', JSON.stringify([newOrder, ...orders]));
      dispatch(clearCart());
      navigate(`/tracking/${mockOrderId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form details */}
          <div className="md:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Delivery Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">State</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={address.zipCode}
                      onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-200/50 cursor-pointer hover:bg-gray-100/50 transition-all">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="w-4 h-4 text-rose-500 focus:ring-rose-500 border-gray-300"
                  />
                  <div>
                    <span className="font-bold text-gray-800 block text-sm">Cash on Delivery (COD)</span>
                    <span className="text-xs text-gray-400">Pay with cash when your food is delivered.</span>
                  </div>
                </label>
                <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-200/50 cursor-pointer hover:bg-gray-100/50 transition-all">
                  <input
                    type="radio"
                    name="payment"
                    value="Online"
                    checked={paymentMethod === 'Online'}
                    onChange={() => setPaymentMethod('Online')}
                    className="w-4 h-4 text-rose-500 focus:ring-rose-500 border-gray-300"
                  />
                  <div>
                    <span className="font-bold text-gray-800 block text-sm">Online Payment (Razorpay / Cards)</span>
                    <span className="text-xs text-gray-400">Instant safe online checkout with credit/debit card or UPI.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 font-extrabold">Final Summary</h3>
              <div className="space-y-3 text-sm font-semibold text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cart.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>₹{deliveryPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{taxPrice}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base text-gray-800">
                  <span>Grand Total</span>
                  <span className="text-rose-500 text-lg">₹{grandTotal}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-center block"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
