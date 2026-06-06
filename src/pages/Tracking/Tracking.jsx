import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaUtensils, FaMotorcycle, FaHome, FaUser, FaPhone } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Tracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [customerCoords, setCustomerCoords] = useState({ lat: 19.0760, lng: 72.8777 }); // Default Mumbai

  // Map reference
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);

  // 1. Geolocation and Leaflet Scripts Loader
  useEffect(() => {
    // Get live customer location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCustomerCoords(coords);
          toast.success("Live location detected successfully!");
        },
        (error) => {
          console.warn("Geolocation permission denied or timed out. Using default coords.");
        }
      );
    }

    // Load Leaflet stylesheet
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet script
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // 2. Poll Order details from server
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders');
        // Find current order
        const currentOrder = res.data.find(o => o._id === id);
        if (currentOrder) {
          setOrder(currentOrder);
        } else {
          // Fallback check localStorage
          const localOrders = JSON.parse(localStorage.getItem('orders')) || [];
          const localMatch = localOrders.find(o => o._id === id);
          if (localMatch) {
            setOrder(localMatch);
          }
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
    const interval = setInterval(fetchOrderDetails, 5000); // Poll every 5s for live updates

    return () => clearInterval(interval);
  }, [id]);

  // 3. Initialize & Update Leaflet Map
  useEffect(() => {
    if (!mapLoaded || !order) return;

    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    // Remove existing map instance if already initialized
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet Map
    try {
      const map = window.L.map('map-container').setView([customerCoords.lat, customerCoords.lng], 14);
      mapInstanceRef.current = map;

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Customer marker setup
      const customerIcon = window.L.divIcon({
        html: `<div style="font-size: 28px;">📍</div>`,
        className: 'custom-leaflet-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });

      window.L.marker([customerCoords.lat, customerCoords.lng], { icon: customerIcon })
        .addTo(map)
        .bindPopup('Your Delivery Address')
        .openPopup();

      // Rider marker offset calculation based on order progress status
      let offsetLat = 0.004;
      let offsetLng = -0.004;

      if (order.orderStatus === 'Preparing') {
        offsetLat = 0.005;
        offsetLng = -0.005;
      } else if (order.orderStatus === 'OutForDelivery') {
        offsetLat = 0.002;
        offsetLng = -0.002;
      } else if (order.orderStatus === 'Delivered') {
        offsetLat = 0;
        offsetLng = 0;
      }

      const riderIcon = window.L.divIcon({
        html: `<div style="font-size: 32px; animation: pulse 1.5s infinite;">🛵</div>`,
        className: 'custom-leaflet-icon',
        iconSize: [35, 35],
        iconAnchor: [17, 35]
      });

      const riderMarker = window.L.marker(
        [customerCoords.lat + offsetLat, customerCoords.lng + offsetLng],
        { icon: riderIcon }
      ).addTo(map);
      
      riderMarkerRef.current = riderMarker;
      riderMarker.bindPopup(
        order.orderStatus === 'Delivered' ? 'Rider has arrived!' : 'Rider is carrying your hot meal!'
      );
    } catch (e) {
      console.error("Map rendering error:", e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded, order, customerCoords]);

  // Determine current step index
  const getStepIndex = (status) => {
    switch (status) {
      case 'Placed': return 0;
      case 'Accepted': return 1;
      case 'Preparing': return 2;
      case 'OutForDelivery': return 3;
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  const steps = [
    { title: 'Order Placed', desc: 'We have received your order.', icon: FaCheckCircle },
    { title: 'Order Accepted', desc: 'Restaurant has accepted your order.', icon: FaCheckCircle },
    { title: 'Preparing Food', desc: 'Chef is preparing your delicious meal.', icon: FaUtensils },
    { title: 'Out for Delivery', desc: 'Our rider is navigating to your address.', icon: FaMotorcycle },
    { title: 'Delivered', desc: 'Enjoy your hot meal!', icon: FaHome },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500 font-bold mt-4">Connecting Live Tracker...</p>
      </div>
    );
  }

  const currentStep = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Tracker Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
          <div>
            <span className="text-xs font-black text-rose-500 bg-rose-50 px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-rose-100">
              Live Tracker Active
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mt-3.5">
              Order ID: <span className="font-mono text-gray-500">#{id?.slice(-8).toUpperCase()}</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1 font-semibold">
              Payment Status: {order?.paymentStatus || 'Pending'} ({order?.paymentMethod || 'COD'})
            </p>
          </div>

          <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-[12px] before:bottom-[12px] before:w-[2px] before:bg-gray-100">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isDone = currentStep >= idx;
              const isCurrent = currentStep === idx;
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

        {/* Live Map & Rider Widget */}
        <div className="lg:col-span-1 space-y-6">
          {/* Rider Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center font-bold">
                RK
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Ramesh Kumar</h4>
                <p className="text-xs text-gray-400 font-medium">BiteDash Delivery Rider</p>
              </div>
            </div>
            <a href="tel:9999999999" className="bg-rose-50 hover:bg-rose-100 p-3 rounded-full text-rose-500 transition-colors">
              <FaPhone className="text-sm" />
            </a>
          </div>

          {/* Interactive Live Map */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 tracking-wide uppercase">Real-Time Routing Map</h3>
            <div
              id="map-container"
              className="w-full h-80 rounded-2xl border border-gray-200 bg-gray-50 shadow-inner z-10"
              style={{ minHeight: '320px' }}
            >
              {!mapLoaded && (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">
                  Initializing Leaflet map nodes...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
