import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaClock, FaCheckCircle, FaShoppingBag, FaCreditCard, FaWallet, FaExclamationCircle } from 'react-icons/fa';
import axios from 'axios';

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders');
        let dbOrders = res.data;
        
        // Filter by user if logged in
        if (user?._id) {
          dbOrders = dbOrders.filter(o => o.user === user._id || o.user?._id === user._id);
        }
        
        // Merge with local storage orders for safety/fallbacks (avoiding duplicates)
        const localOrders = JSON.parse(localStorage.getItem('orders')) || [];
        const merged = [...dbOrders];
        
        localOrders.forEach(local => {
          if (!merged.some(m => m._id === local._id)) {
            merged.push(local);
          }
        });

        // Sort by date descending
        merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(merged);
      } catch (error) {
        console.error("Failed to fetch orders from server, using local storage fallback:", error);
        const localOrders = JSON.parse(localStorage.getItem('orders')) || [];
        localOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(localOrders);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // Poll every 8s for live status changes
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const getPaymentBadge = (method, status) => {
    if (status === 'Completed') {
      return (
        <span className="text-xs font-bold bg-green-50 text-green-600 px-3 py-1 rounded-full flex items-center gap-1.5 border border-green-100">
          <FaCheckCircle className="text-[10px]" />
          <span>Paid ({method})</span>
        </span>
      );
    } else if (method === 'COD') {
      return (
        <span className="text-xs font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full flex items-center gap-1.5 border border-amber-100">
          <FaWallet className="text-[10px]" />
          <span>Cash Pending (COD)</span>
        </span>
      );
    } else {
      return (
        <span className="text-xs font-bold bg-rose-50 text-rose-600 px-3 py-1 rounded-full flex items-center gap-1.5 border border-rose-100">
          <FaExclamationCircle className="text-[10px]" />
          <span>Pay Pending ({method})</span>
        </span>
      );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center gap-3">
          <FaShoppingBag className="text-rose-500" />
          <span>My Orders</span>
        </h1>

        {loading && orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 font-bold mt-4">Syncing your order log...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                    <span className="text-[10px] font-black tracking-wide bg-rose-50 text-rose-500 px-3 py-1 rounded-full border border-rose-100 uppercase">
                      ID: #{order._id?.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    {getPaymentBadge(order.paymentMethod, order.paymentStatus)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mt-3">{order.restaurantName || order.restaurant?.name || 'QuickBite Partner'}</h3>
                  <div className="text-sm font-medium text-gray-400 mt-1.5 max-w-md truncate">
                    {order.items?.map((it) => `${it.name} x${it.quantity}`).join(', ')}
                  </div>
                </div>

                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-3.5 border-t sm:border-t-0 border-gray-50 pt-4 sm:pt-0">
                  <div className="flex flex-col sm:items-end">
                    <span className="text-xs text-gray-400 font-bold">Total Amount</span>
                    <span className="font-black text-gray-800 text-xl">₹{order.totalAmount}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                      order.orderStatus === 'Delivered'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-orange-50 text-orange-600'
                    }`}>
                      {order.orderStatus === 'Delivered' ? <FaCheckCircle /> : <FaClock />}
                      <span>{order.orderStatus}</span>
                    </span>
                    <button
                      onClick={() => navigate(`/tracking/${order._id}`)}
                      className="text-xs font-black text-rose-500 hover:text-rose-600 border border-rose-200 hover:border-rose-300 px-4 py-1.5 rounded-full transition-all uppercase tracking-wide bg-white shadow-sm"
                    >
                      Track
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-lg text-gray-400 font-semibold">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/restaurants')}
              className="mt-6 bg-rose-500 text-white font-bold px-6 py-2.5 rounded-full shadow-md hover:bg-rose-600 transition-colors"
            >
              Order Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
