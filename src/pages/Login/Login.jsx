import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/authSlice';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDemoLogin = (role) => {
    dispatch(loginStart());
    const mockUser = {
      _id: role === 'customer' ? 'usr_cust' : 'usr_owner',
      name: role === 'customer' ? 'Jane Doe' : 'Chef Mario',
      email: role === 'customer' ? 'customer@bitedash.com' : 'restaurant@bitedash.com',
      phone: role === 'customer' ? '9876543210' : '9876543211',
      role: role,
    };
    dispatch(loginSuccess({ user: mockUser, token: 'mock_jwt_token_xyz' }));
    toast.success(`Logged in successfully as ${mockUser.name}`);
    navigate('/');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Simulate real login using demo account info or validate format
    dispatch(loginStart());
    setTimeout(() => {
      const mockUser = {
        _id: 'usr_custom_login',
        name: formData.email.split('@')[0],
        email: formData.email,
        phone: '9999999999',
        role: 'customer',
      };
      dispatch(loginSuccess({ user: mockUser, token: 'mock_jwt_token_xyz' }));
      toast.success(`Logged in as ${mockUser.name}`);
      navigate('/');
    }, 800);
  };

  return (
    <div className="bg-gradient-to-tr from-rose-50 to-orange-50 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl max-w-md w-full border border-white"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-500 mt-2">Log in to order delicious food and track orders</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <div className="border-b border-gray-200 flex-grow"></div>
          <span className="text-xs text-gray-400 px-3 uppercase tracking-wider font-semibold">Or fast login</span>
          <div className="border-b border-gray-200 flex-grow"></div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <button
            onClick={() => handleDemoLogin('customer')}
            className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold py-2 rounded-xl text-sm transition-all border border-orange-200/50"
          >
            Demo Customer
          </button>
          <button
            onClick={() => handleDemoLogin('restaurant_owner')}
            className="bg-amber-50 hover:bg-amber-100 text-amber-600 font-bold py-2 rounded-xl text-sm transition-all border border-amber-200/50"
          >
            Demo Owner
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-rose-500 hover:underline font-bold">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
