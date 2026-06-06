import React from 'react';
import { useSelector } from 'react-redux';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

import { useState, useEffect } from 'react';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const [liveLocation, setLiveLocation] = useState(
    localStorage.getItem('userLiveLocation') || 'No GPS position detected'
  );

  useEffect(() => {
    const syncLocation = () => {
      setLiveLocation(localStorage.getItem('userLiveLocation') || 'No GPS position detected');
    };
    window.addEventListener('locationChanged', syncLocation);
    return () => window.removeEventListener('locationChanged', syncLocation);
  }, []);

  const mockAddresses = [
    { type: '🎯 Detected Live Location (GPS)', address: liveLocation },
    { type: 'Home', address: '123, Green Avenue, Mumbai, Maharashtra - 400001' },
    { type: 'Work', address: '456, Business Hub, Bandra East, Mumbai, Maharashtra - 400051' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center gap-3">
          <FaUser className="text-rose-500" />
          <span>My Profile</span>
        </h1>

        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left side: user info */}
            <div className="md:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4 text-3xl font-bold shadow-inner">
                {user.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
              <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider mt-2">
                {user.role}
              </span>

              <div className="w-full text-left space-y-4 mt-8 text-sm text-gray-600 font-semibold border-t border-gray-50 pt-6">
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-gray-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="text-gray-400" />
                  <span>{user.phone}</span>
                </div>
              </div>
            </div>

            {/* Right side: address book */}
            <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaMapMarkerAlt className="text-rose-500" />
                <span>Saved Addresses</span>
              </h3>

              <div className="space-y-4">
                {mockAddresses.map((addr) => (
                  <div key={addr.type} className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                    <span className="font-bold text-sm text-gray-800 block mb-1">{addr.type}</span>
                    <span className="text-sm text-gray-500 font-medium">{addr.address}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <p className="text-lg text-gray-400 font-semibold">Please log in to view your profile.</p>
          </div>
        )}
      </div>
    </div>
  );
}
