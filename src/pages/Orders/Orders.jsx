import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaShoppingBag } from 'react-icons/fa';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    setOrders(savedOrders);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center gap-3">
          <FaShoppingBag className="text-rose-500" />
          <span>My Orders</span>
        </h1>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold bg-rose-50 text-rose-500 px-3 py-1 rounded-full">
                      {order._id}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mt-2">{order.restaurantName}</h3>
                  <div className="text-sm text-gray-500 mt-1 max-w-md truncate">
                    {order.items.map((it) => `${it.name} x${it.quantity}`).join(', ')}
                  </div>
                </div>

                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-gray-50 pt-4 sm:pt-0">
                  <span className="font-extrabold text-gray-800 text-lg">₹{order.totalAmount}</span>
                  <div className="flex items-center space-x-3 mt-1">
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
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 border border-rose-200 hover:border-rose-300 px-3 py-1 rounded-full transition-all"
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
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
