import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { clearCart } from '../../redux/slices/cartSlice';
import { FaLock, FaCreditCard, FaShieldAlt, FaRegCalendarAlt, FaKey, FaCheck, FaPhone, FaWallet } from 'react-icons/fa';

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
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${user._id}/wallet`);
        setWalletBalance(res.data.walletBalance || 0);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      } finally {
        setWalletLoading(false);
      }
    };
    fetchWallet();
  }, [user]);

  // Simulated Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [paymentStep, setPaymentStep] = useState('form'); // 'form' | 'loading' | 'otp' | 'success'
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [loadingText, setLoadingText] = useState('Securing payment gateway connection...');

  const deliveryPrice = cart.restaurant?.deliveryPrice || 0;
  const taxPrice = Math.round(cart.totalAmount * 0.05);
  const grandTotal = cart.totalAmount + deliveryPrice + taxPrice;

  // Handle OTP countdown timer
  useEffect(() => {
    let timerInterval = null;
    if (showPaymentModal && paymentStep === 'otp' && otpTimer > 0) {
      timerInterval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      clearInterval(timerInterval);
    }
    return () => clearInterval(timerInterval);
  }, [showPaymentModal, paymentStep, otpTimer]);

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const parts = value.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvv(value);
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!address.line1.trim() || !address.city.trim() || !address.state.trim() || !address.zipCode.trim()) {
      toast.error('Please fill in a complete delivery address.');
      return;
    }

    if (paymentMethod === 'Online') {
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setCardName(user?.name || '');
      setOtp('');
      setPaymentStep('form');
      setShowPaymentModal(true);
    } else {
      placeFinalOrder();
    }
  };

  const placeFinalOrder = async (onlineDetails = null) => {
    setLoading(true);
    try {
      const orderData = {
        user: user?._id || '60d014000000000000000009',
        restaurant: cart.restaurant?._id || '60d014000000000000000001',
        items: cart.items.map(item => ({
          food: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        deliveryAddress: '60d014000000000000000002', // Fallback address format
        totalAmount: grandTotal,
        deliveryPrice,
        taxPrice,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed',
        transactionId: onlineDetails?.transactionId || null
      };

      const res = await axios.post('http://localhost:5000/api/orders', orderData);
      const placedOrder = res.data;

      // Sync with localStorage for fallback views
      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      localStorage.setItem('orders', JSON.stringify([
        { ...placedOrder, restaurantName: cart.restaurant?.name || 'QuickBite Partner' },
        ...orders
      ]));

      dispatch(clearCart());
      toast.success('Order placed successfully in Database!');
      setShowPaymentModal(false);
      navigate(`/tracking/${placedOrder._id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to save order on Server. Using offline simulation...');
      
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
        transactionId: onlineDetails?.transactionId || `mock_tx_${Math.floor(100000 + Math.random() * 900000)}`
      };
      localStorage.setItem('orders', JSON.stringify([newOrder, ...orders]));
      dispatch(clearCart());
      setShowPaymentModal(false);
      navigate(`/tracking/${mockOrderId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCardPaymentSubmit = (e) => {
    e.preventDefault();
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardExpiry || cardExpiry.length !== 5) {
      toast.error('Please enter expiry in MM/YY format.');
      return;
    }
    const [month, year] = cardExpiry.split('/');
    const m = parseInt(month, 10);
    if (isNaN(m) || m < 1 || m > 12) {
      toast.error('Invalid card expiry month.');
      return;
    }
    if (!cardCvv || cardCvv.length !== 3) {
      toast.error('Please enter a valid 3-digit CVV.');
      return;
    }
    if (!cardName.trim()) {
      toast.error('Please enter cardholder name.');
      return;
    }

    setPaymentStep('loading');
    setLoadingText('Connecting with BiteDash secure server nodes...');

    setTimeout(() => {
      setLoadingText('Validating credit credentials & verifying CVV hash...');
      setTimeout(() => {
        setLoadingText('Generating session One-Time Password (OTP)...');
        setTimeout(() => {
          setPaymentStep('otp');
          setOtpTimer(60);
          setOtp('');
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6 || isNaN(parseInt(otp))) {
      toast.error('Please enter a valid 6-digit OTP code.');
      return;
    }

    setPaymentStep('loading');
    setLoadingText('Authorizing transaction payment amount...');

    setTimeout(() => {
      setLoadingText('Securing banking confirmation tokens...');
      setTimeout(() => {
        setPaymentStep('success');
      }, 1000);
    }, 1000);
  };

  const handleResendOtp = () => {
    setOtpTimer(60);
    setOtp('');
    toast.success('A new 6-digit verification code has been dispatched!');
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
                <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-200/50 cursor-pointer hover:bg-gray-100/50 transition-all">
                  <input
                    type="radio"
                    name="payment"
                    value="Wallet"
                    checked={paymentMethod === 'Wallet'}
                    onChange={() => setPaymentMethod('Wallet')}
                    className="w-4 h-4 text-rose-500 focus:ring-rose-500 border-gray-300"
                  />
                  <div className="flex-grow flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-800 block text-sm flex items-center gap-1.5">
                        <FaWallet className="text-blue-500 text-xs" />
                        Pay with Digital Wallet
                      </span>
                      <span className="text-xs text-gray-400">Deduct instantly from your secure local wallet.</span>
                    </div>
                    <div className="text-right pl-2 shrink-0">
                      <span className="text-xs font-black block text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        ₹{walletBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </label>

                {paymentMethod === 'Wallet' && walletBalance < grandTotal && (
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mt-2 flex flex-col gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className="text-rose-500 text-sm mt-0.5">⚠️</span>
                      <div>
                        <h5 className="font-bold text-rose-800 text-xs">Insufficient Wallet Funds</h5>
                        <p className="text-[11px] text-rose-600 mt-0.5">
                          Your available balance is ₹{walletBalance.toFixed(2)}, but this order requires ₹{grandTotal.toFixed(2)}.
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/wallet"
                      className="text-[10px] bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold py-1.5 px-3 rounded-lg transition-all text-center self-start"
                    >
                      Top up Wallet &rarr;
                    </Link>
                  </div>
                )}
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
                disabled={loading || (paymentMethod === 'Wallet' && walletBalance < grandTotal)}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-center block focus:outline-none"
              >
                {loading 
                  ? 'Processing...' 
                  : paymentMethod === 'Online' 
                    ? 'Pay Online' 
                    : paymentMethod === 'Wallet' 
                      ? 'Pay with Wallet' 
                      : 'Place COD Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Premium Payment Gateway Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
          <div className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col transition-all">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 text-white">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💳</span>
                <div>
                  <h3 className="font-extrabold text-base tracking-wide uppercase">BiteDash Pay</h3>
                  <p className="text-[10px] text-gray-400 font-medium">100% Encrypted Gateway Transaction</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {/* Content Body based on step */}
            <div className="p-8 flex-grow">
              
              {/* Form Step */}
              {paymentStep === 'form' && (
                <form onSubmit={handleCardPaymentSubmit} className="space-y-6">
                  {/* Dynamic Credit Card Layout Preview */}
                  <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-rose-500 via-orange-500 to-red-600 p-6 text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10 font-bold text-7xl select-none">VISA</div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-white/75">Debit Card</p>
                        <p className="text-sm font-bold mt-1">BiteDash Premium Member</p>
                      </div>
                      <div className="w-10 h-8 bg-amber-300 rounded-md border border-white/20 flex items-center justify-center opacity-95">
                        <span className="text-lg">🪙</span>
                      </div>
                    </div>

                    <div className="my-2">
                      <p className="font-mono text-lg tracking-wider text-center select-all">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </p>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-white/75">Card Holder</p>
                        <p className="text-xs font-black truncate max-w-[150px] uppercase">{cardName || 'YOUR FULL NAME'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-wider text-white/75">Expires</p>
                        <p className="text-xs font-black">{cardExpiry || 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <FaCreditCard className="text-gray-400" />
                        <span>Card Number</span>
                      </label>
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                          <FaRegCalendarAlt className="text-gray-400" />
                          <span>Expiry Date</span>
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                          <FaLock className="text-gray-400" />
                          <span>CVV Code</span>
                        </label>
                        <input
                          type="password"
                          placeholder="***"
                          value={cardCvv}
                          onChange={handleCvvChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-400">Merchant Payment: ₹{grandTotal}</span>
                    <button
                      type="submit"
                      className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all"
                    >
                      Authorize Pay
                    </button>
                  </div>
                </form>
              )}

              {/* Loading Authentication Step */}
              {paymentStep === 'loading' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-rose-500 text-lg">🔒</div>
                  </div>
                  <div className="text-center space-y-1.5">
                    <h4 className="font-bold text-gray-800 text-lg">Secure Payment Verification</h4>
                    <p className="text-xs text-gray-400 font-semibold animate-pulse">{loadingText}</p>
                  </div>
                </div>
              )}

              {/* OTP Input Step */}
              {paymentStep === 'otp' && (
                <form onSubmit={handleOtpVerify} className="space-y-6 text-center">
                  <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 text-left">
                    <span className="text-2xl mt-0.5">🔑</span>
                    <div>
                      <h4 className="font-bold text-rose-800 text-xs uppercase tracking-wide">OTP Authentication Required</h4>
                      <p className="text-[11px] text-rose-700/80 font-medium mt-0.5">
                        We have dispatched a 6-digit confirmation security code to your account phone number ending in {user?.phone ? user.phone.slice(-4) : '3210'}.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Enter One-Time PIN</label>
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-44 bg-gray-50 border-2 border-gray-200 focus:border-rose-500 focus:bg-white text-center rounded-2xl py-3 text-2xl font-bold tracking-widest text-gray-800 focus:outline-none transition-all mx-auto block"
                    />
                  </div>

                  <div className="flex flex-col items-center gap-4 pt-4 border-t border-gray-100">
                    <button
                      type="submit"
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition-all"
                    >
                      Confirm Payment
                    </button>
                    {otpTimer > 0 ? (
                      <span className="text-xs font-bold text-gray-400">
                        Resend code in <span className="text-rose-500">{otpTimer}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-xs font-black text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider"
                      >
                        Resend OTP Code
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Success Notification Step */}
              {paymentStep === 'success' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-5 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl shadow-inner animate-bounce">
                    <FaCheck />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-gray-800 text-lg">Transaction Authorized!</h4>
                    <p className="text-xs text-gray-400 font-semibold">Payment captured. Registering order record...</p>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold tracking-wider">
              <FaShieldAlt className="text-xs text-green-500" />
              <span>SECURED BY PCI-DSS STANDARD COMPLIANCE</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
