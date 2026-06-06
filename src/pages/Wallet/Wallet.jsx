import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaWallet, FaCreditCard, FaLock, FaShieldAlt, FaRegCalendarAlt, FaKey,
  FaCheck, FaArrowDown, FaArrowUp, FaTimes, FaSpinner, FaHistory
} from 'react-icons/fa';

export default function Wallet() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // Wallet States
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  
  // Simulated Card Payment Gateway Modal States
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [gatewayStep, setGatewayStep] = useState('form'); // 'form' | 'loading' | 'otp' | 'success'
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [gatewayStatusText, setGatewayStatusText] = useState('Initiating secure vault handshake...');

  // Fetch Wallet Data on Load
  const fetchWalletData = async () => {
    if (!user?._id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${user._id}/wallet`);
      setBalance(res.data.walletBalance || 0);
      
      // Sort transactions descending by date
      const sortedTx = (res.data.walletTransactions || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTransactions(sortedTx);
    } catch (error) {
      console.error('Error fetching wallet details:', error);
      toast.error('Failed to load wallet data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      // Allow some grace time or redirect immediately
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          toast.error('Please log in to access your wallet.');
          navigate('/login');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
    fetchWalletData();
  }, [isAuthenticated, user, navigate]);

  // Handle OTP countdown timer
  useEffect(() => {
    let timerInterval = null;
    if (showCardModal && gatewayStep === 'otp' && otpTimer > 0) {
      timerInterval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      clearInterval(timerInterval);
    }
    return () => clearInterval(timerInterval);
  }, [showCardModal, gatewayStep, otpTimer]);

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

  const handleDepositInit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(depositAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid deposit amount.');
      return;
    }
    
    // Reset modal states
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardName(user?.name || '');
    setOtp('');
    setGatewayStep('form');
    setShowCardModal(true);
  };

  const handleGatewaySubmit = (e) => {
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

    setGatewayStep('loading');
    setGatewayStatusText('Connecting to merchant gateway...');

    setTimeout(() => {
      setGatewayStatusText('Securing card transaction credentials...');
      setTimeout(() => {
        setGatewayStatusText('Requesting One-Time Password (OTP) validation token...');
        setTimeout(() => {
          setGatewayStep('otp');
          setOtpTimer(60);
          setOtp('');
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6 || isNaN(parseInt(otp))) {
      toast.error('Please enter the 6-digit OTP code.');
      return;
    }

    setGatewayStep('loading');
    setGatewayStatusText('Validating security code and settling funds...');

    try {
      const res = await axios.post(`http://localhost:5000/api/users/${user._id}/wallet/add`, {
        amount: parseFloat(depositAmount),
        description: 'Deposited via cards'
      });

      if (res.data.success) {
        setBalance(res.data.walletBalance);
        const sortedTx = (res.data.walletTransactions || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setTransactions(sortedTx);
        setGatewayStep('success');
        setDepositAmount('');
        toast.success('Money added to wallet successfully!');
      } else {
        throw new Error('Transaction rejected by server.');
      }
    } catch (error) {
      console.error('Wallet deposit server error:', error);
      toast.error(error.response?.data?.message || 'Gateway transaction failed.');
      setGatewayStep('form');
    }
  };

  const formatAmount = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center max-w-sm text-center bg-white p-8 rounded-3xl shadow-md">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Verifying session...</h2>
          <p className="text-gray-500 text-sm mt-2">Please log in to view and deposit funds to your wallet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-blue-100 rounded-2xl text-blue-600">
                <FaWallet className="text-2xl" />
              </span>
              Digital Wallet
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage, deposit, and pay using your secure local balance.</p>
          </div>
          <Link
            to="/restaurants"
            className="self-start md:self-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-2xl transition-all shadow-md shadow-blue-100 hover:shadow-lg hover:-translate-y-0.5"
          >
            Order Food Now
          </Link>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* 1. Metallic Wallet Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-blue-200/50 flex flex-col justify-between min-h-[240px]">
            {/* Glossy Overlay Details */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-start z-10">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-blue-200 font-bold">QuickBite Wallet Card</span>
                <h3 className="text-lg font-bold text-white/95">{user.name}</h3>
              </div>
              <div className="w-12 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                <span className="text-[10px] text-white/80 font-extrabold tracking-wider">PAY</span>
              </div>
            </div>

            <div className="z-10 mt-6">
              <span className="text-xs text-blue-200/80 font-medium block">Available Balance</span>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-1">
                {formatAmount(balance)}
              </div>
            </div>

            <div className="flex justify-between items-center z-10 border-t border-white/10 pt-4 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-amber-400/80 rounded-md shadow-inner flex items-center justify-center relative overflow-hidden">
                  <div className="grid grid-cols-3 gap-0.5 w-full h-full p-1 opacity-70">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="border border-amber-950/20 rounded-[1px]"></div>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-white/70 font-semibold font-mono">**** **** **** {user.phone ? user.phone.slice(-4) : '8888'}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-blue-300 block">Status</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Active</span>
              </div>
            </div>
          </div>

          {/* 2. Quick Deposit Card */}
          <div className="bg-white rounded-3xl p-8 border border-blue-50 shadow-md shadow-blue-50 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-blue-900 mb-1">Add Funds</h3>
              <p className="text-xs text-gray-400">Load money instantly using cards or bank transfer.</p>
              
              <form onSubmit={handleDepositInit} className="space-y-4 mt-6">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-lg">₹</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-gray-800 font-extrabold text-lg pl-9 pr-4 py-3.5 rounded-2xl outline-none transition-all"
                  />
                </div>

                {/* Pre-selected Deposit Values */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[100, 500, 1000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDepositAmount(val.toString())}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        depositAmount === val.toString()
                          ? 'bg-blue-50 text-blue-600 border-blue-200 font-extrabold shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:text-blue-500'
                      }`}
                    >
                      +₹{val}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-md shadow-blue-100 hover:shadow-lg"
                >
                  Deposit to Wallet
                </button>
              </form>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-6 md:mt-0 pt-4 border-t border-slate-50">
              <FaShieldAlt className="text-emerald-500" />
              <span>PCI-DSS Secured. Bank-grade 256-bit encryption.</span>
            </div>
          </div>

        </div>

        {/* Transaction History Section */}
        <div className="bg-white rounded-3xl p-8 border border-blue-50 shadow-md shadow-blue-50 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-lg font-extrabold text-blue-900 flex items-center gap-2.5">
              <FaHistory className="text-blue-500 text-sm" />
              Transaction History
            </h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold">
              {transactions.length} Records
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <FaSpinner className="animate-spin text-3xl text-blue-600 mb-2" />
              <span className="text-xs">Fetching ledger details...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500">
                <FaWallet className="text-2xl" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">No Transactions Found</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  You haven't deposited or made purchases using your digital wallet yet. Add some funds to check it out!
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-2">
              {transactions.map((tx, idx) => {
                const isDeposit = tx.type === 'Deposit';
                const isRefund = tx.type === 'Refund';
                
                return (
                  <div key={tx._id || idx} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      {/* Icon Indicator */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isDeposit 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : isRefund 
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-rose-50 text-rose-600'
                      }`}>
                        {isDeposit ? <FaArrowUp className="text-xs" /> : isRefund ? <FaArrowUp className="text-xs rotate-180" /> : <FaArrowDown className="text-xs" />}
                      </div>

                      <div>
                        <span className="text-xs font-bold text-gray-800 block">{tx.description || (isDeposit ? 'Wallet Deposit' : 'Food Purchase')}</span>
                        <span className="text-[10px] text-gray-400">{formatDate(tx.createdAt)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-black ${
                        isDeposit 
                          ? 'text-emerald-600' 
                          : isRefund 
                            ? 'text-blue-600'
                            : 'text-rose-600'
                      }`}>
                        {isDeposit ? '+' : isRefund ? '+' : '-'} {formatAmount(tx.amount)}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold mt-0.5">{tx.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Simulated Deposit Gateway Modal */}
      <AnimatePresence>
        {showCardModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative border border-slate-100"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Secure Payment Vault</span>
                </div>
                <button
                  onClick={() => setShowCardModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6">
                
                {/* 1. Card Form Step */}
                {gatewayStep === 'form' && (
                  <form onSubmit={handleGatewaySubmit} className="space-y-4">
                    <div className="text-center pb-2">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Deposit Transaction Amount</span>
                      <h4 className="text-2xl font-black text-blue-900 mt-1">{formatAmount(parseFloat(depositAmount))}</h4>
                    </div>

                    <div className="space-y-3">
                      
                      {/* Card Number */}
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Card Number</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><FaCreditCard /></span>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="4111 2222 3333 4444"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs pl-9 pr-4 py-3 rounded-xl outline-none font-semibold text-gray-800 transition-all"
                          />
                        </div>
                      </div>

                      {/* Expiry & CVV */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Expiry Date</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><FaRegCalendarAlt /></span>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={handleExpiryChange}
                              placeholder="MM/YY"
                              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs pl-9 pr-4 py-3 rounded-xl outline-none font-semibold text-gray-800 transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">CVV / CVC</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><FaLock /></span>
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={handleCvvChange}
                              placeholder="***"
                              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs pl-9 pr-4 py-3 rounded-xl outline-none font-semibold text-gray-800 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cardholder Name */}
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="JANE DOE"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs px-4 py-3 rounded-xl outline-none font-semibold text-gray-800 transition-all uppercase"
                        />
                      </div>

                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 mt-2"
                    >
                      <FaLock className="text-[10px]" /> Proceed Securely
                    </button>
                  </form>
                )}

                {/* 2. Loading / Handshake Step */}
                {gatewayStep === 'loading' && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <FaSpinner className="animate-spin text-4xl text-blue-600" />
                    <div className="text-center">
                      <h4 className="text-sm font-bold text-gray-800">Authorization In Progress</h4>
                      <p className="text-[11px] text-gray-400 mt-1">{gatewayStatusText}</p>
                    </div>
                  </div>
                )}

                {/* 3. OTP Validation Step */}
                {gatewayStep === 'otp' && (
                  <form onSubmit={handleOtpVerify} className="space-y-4">
                    <div className="text-center pb-2">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">OTP Code Dispatched</span>
                      <p className="text-[11px] text-gray-400 mt-1">
                        A verification code was sent to the phone linked with this card. Enter it below to settle transaction.
                      </p>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">One-Time Password</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><FaKey /></span>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter 6-digit OTP (e.g. 123456)"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs pl-9 pr-4 py-3 rounded-xl outline-none font-bold text-gray-800 transition-all text-center tracking-widest"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold px-1">
                      <span>Gateway Countdown:</span>
                      <span className={otpTimer > 10 ? 'text-blue-600' : 'text-rose-500 animate-pulse'}>
                        {otpTimer > 0 ? `${otpTimer}s remaining` : 'OTP Expired'}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={otpTimer === 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 mt-2"
                    >
                      <FaCheck className="text-[10px]" /> Verify OTP & Settle Funds
                    </button>
                    
                    {otpTimer === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setOtpTimer(60);
                          setOtp('');
                          setGatewayStep('otp');
                          toast.success('New simulated OTP has been dispatched.');
                        }}
                        className="w-full text-center text-xs text-blue-600 font-bold hover:underline"
                      >
                        Resend Verification Code
                      </button>
                    )}
                  </form>
                )}

                {/* 4. Transaction Success Step */}
                {gatewayStep === 'success' && (
                  <div className="py-8 flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center text-2xl shadow-inner">
                      <FaCheck />
                    </div>
                    <div className="text-center">
                      <h4 className="text-base font-extrabold text-blue-900">Deposit Completed!</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Funds have been successfully secured and credited to your digital wallet.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCardModal(false)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm"
                    >
                      Dismiss Receipt
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
