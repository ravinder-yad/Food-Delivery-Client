import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaUtensils, FaMotorcycle, FaHome, FaUser } from 'react-icons/fa';

export default function Tracking() {
  const { id } = useParams();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev < 4) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const steps = [
    { title: 'Order Placed', desc: 'We have received your order.', icon: FaCheckCircle },
    { title: 'Order Accepted', desc: 'Restaurant has accepted your order.', icon: FaCheckCircle },
    { title: 'Preparing Food', desc: 'Chef is preparing your delicious meal.', icon: FaUtensils },
    { title: 'Out for Delivery', desc: 'Our rider is on the way to your home.', icon: FaMotorcycle },
    { title: 'Delivered', desc: 'Enjoy your food!', icon: FaHome },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Progress Tracker */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-8">
          <div>
            <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider">Live Tracking</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mt-2">Order ID: {id}</h1>
            <p className="text-sm text-gray-400 mt-1">Estimated delivery time: 30-40 mins</p>
          </div>

          <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-[12px] before:bottom-[12px] before:w-[2px] before:bg-gray-100">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isDone = step >= idx;
              const isCurrent = step === idx;
              return (
                <div key={idx} className="relative flex gap-4">
                  <div className={`absolute -left-[29px] w-[34px] h-[34px] rounded-full flex items-center justify-center border-2 transition-all ${
                    isDone
                      ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-200'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}>
                    <Icon className="text-sm" />
                  </div>
                  <div className="pl-4">
                    <h3 className={`font-bold text-base transition-colors ${
                      isDone ? 'text-gray-800' : 'text-gray-400'
                    } ${isCurrent ? 'text-rose-500 font-extrabold scale-105 origin-left' : ''}`}>
                      {s.title}
                    </h3>
                    <p className={`text-sm mt-0.5 transition-colors ${
                      isDone ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Partner Details & Mock Map */}
        <div className="md:col-span-1 space-y-6">
          {/* Rider profile */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500">
              <FaUser className="text-lg" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Ramesh Kumar</h4>
              <p className="text-xs text-gray-400">Your BiteDash Delivery Partner</p>
              <p className="text-xs text-rose-500 font-bold mt-1">⭐ 4.9 (1,200 deliveries)</p>
            </div>
          </div>

          {/* Mock Map Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden relative">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Live Location Map</h3>
            <div className="bg-slate-100 h-64 rounded-2xl border border-gray-200/50 flex flex-col justify-center items-center text-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="relative z-10 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-200"
              >
                <FaMotorcycle />
              </motion.div>
              
              <span className="text-xs text-gray-400 font-bold mt-4 relative z-10">Rider is navigating to your address...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
