import React, { useState, useEffect } from 'react';
import { Mail, KeyRound, X, ArrowLeft, Loader2, Sparkles, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, initialMode = 'login', onAuthSuccess, onAccountDeleted, initialEmail = '', notify }) => {
  const [mode, setMode] = useState(initialMode); // 'login', 'signup', or 'delete_account'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtpNotice, setDevOtpNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  useEffect(() => {
    setMode(initialMode);
    setEmail(initialEmail || '');
    setStep(1);
    setOtp('');
    setDevOtpNotice(null);
    setErrorNotice(null);
  }, [initialMode, initialEmail, isOpen]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  const isDeleteMode = mode === 'delete_account';

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      notify?.("Please enter a valid Google/Gmail address", "error");
      return;
    }

    setLoading(true);
    setDevOtpNotice(null);
    setErrorNotice(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), mode })
      });
      const data = await res.json();

      if (data.success) {
        setStep(2);
        setResendTimer(30);
        notify?.(data.message || "OTP sent to your email!");
        if (data.devOtp) {
          setDevOtpNotice(data.devOtp);
        }
      } else {
        setErrorNotice(data);
        notify?.(data.message || "Failed to send OTP", "error");
      }
    } catch (err) {
      console.error(err);
      notify?.("Network error while connecting to backend.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      notify?.("Please enter the 6-digit OTP", "error");
      return;
    }

    setLoading(true);
    try {
      if (isDeleteMode) {
        const res = await fetch('/api/auth/delete-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
        });
        const data = await res.json();

        if (data.success) {
          notify?.(data.message || "Account deleted successfully");
          onAccountDeleted?.();
          onClose();
        } else {
          notify?.(data.message || "Invalid OTP code", "error");
        }
      } else {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), otp: otp.trim(), mode })
        });
        const data = await res.json();

        if (data.success) {
          notify?.(data.message || "Authentication successful!");
          onAuthSuccess(data.user, data.token);
          onClose();
        } else {
          notify?.(data.message || "Invalid OTP code", "error");
        }
      }
    } catch (err) {
      console.error(err);
      notify?.("Network error while verifying OTP.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden transform transition-all">
        
        {/* Modal Top Header */}
        <div className={`${isDeleteMode ? 'bg-rose-900' : 'bg-slate-800'} text-white p-6 pb-5 relative transition-colors`}>
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-black/20 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="logo font-bold text-white text-2xl flex items-center gap-1.5 mb-1">
            {isDeleteMode ? (
              <>
                <AlertTriangle size={24} className="text-rose-400" />
                <span>Delete Account</span>
              </>
            ) : (
              <>
                <span className='text-blue-400'>&lt;</span>
                Pass
                <span className='text-blue-400'>Saver/&gt;</span>
              </>
            )}
          </div>
          <p className="text-slate-300 text-xs sm:text-sm">
            {isDeleteMode 
              ? (step === 1 
                  ? 'Permanently delete your account and all saved passwords from MongoDB.' 
                  : 'Enter the 6-digit deletion OTP sent to your Gmail.')
              : (step === 1 
                  ? (mode === 'login' ? 'Welcome back! Sign in with Google Email OTP' : 'Create a new account to store passwords securely') 
                  : 'Enter the 6-digit code sent to your Gmail')}
          </p>

          {/* Mode Switch Tabs (Only for regular login/signup in Step 1) */}
          {!isDeleteMode && step === 1 && (
            <div className="flex bg-slate-900/80 rounded-lg p-1 mt-4">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorNotice(null); }}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${mode === 'login' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorNotice(null); }}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${mode === 'signup' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorNotice && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                <span>{errorNotice.message}</span>
              </div>
              {errorNotice.alreadyExists && (
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorNotice(null); }}
                  className="w-fit text-blue-600 font-bold hover:underline cursor-pointer text-xs"
                >
                  👉 Click here to Login with this email
                </button>
              )}
              {errorNotice.notFound && (
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorNotice(null); }}
                  className="w-fit text-blue-600 font-bold hover:underline cursor-pointer text-xs"
                >
                  👉 Click here to Sign Up with this email
                </button>
              )}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Gmail / Google Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDeleteMode ? 'text-rose-500' : 'text-blue-500'}`} size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorNotice(null); }}
                    placeholder="example@gmail.com"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  {isDeleteMode 
                    ? 'A deletion confirmation code will be sent to this email.' 
                    : 'We will send a one-time verification OTP to this Google email.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${isDeleteMode ? 'bg-rose-600 hover:bg-rose-500' : 'bg-blue-600 hover:bg-blue-500'} text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Sending OTP via Gmail...</span>
                  </>
                ) : (
                  <>
                    {isDeleteMode ? <Trash2 size={18} /> : <Sparkles size={18} />}
                    <span>{isDeleteMode ? 'Send Deletion Code' : 'Send Verification Code'}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft size={14} /> Change Email
                </button>
                <span className="text-xs text-slate-500 font-mono">{email}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  6-Digit OTP Code
                </label>
                <div className="relative">
                  <KeyRound className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDeleteMode ? 'text-rose-500' : 'text-blue-500'}`} size={18} />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full pl-11 pr-4 py-2.5 tracking-widest text-center font-mono font-bold text-lg rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 transition"
                    autoFocus
                  />
                </div>

                {devOtpNotice && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center justify-between">
                    <span>Dev Mode OTP: <strong className="font-mono text-sm">{devOtpNotice}</strong></span>
                    <button 
                      type="button" 
                      onClick={() => setOtp(devOtpNotice)}
                      className="underline text-blue-600 hover:text-blue-800 font-medium ml-2"
                    >
                      Fill
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${isDeleteMode ? 'bg-rose-600 hover:bg-rose-500' : 'bg-blue-600 hover:bg-blue-500'} text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    {isDeleteMode ? <Trash2 size={18} /> : <CheckCircle2 size={18} />}
                    <span>
                      {isDeleteMode 
                        ? 'Confirm & Delete Account Permanently' 
                        : (mode === 'login' ? 'Verify & Login' : 'Verify & Create Account')}
                    </span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                {resendTimer > 0 ? (
                  <span className="text-xs text-slate-400">
                    Resend code in <strong className="text-slate-600 font-mono">{resendTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Didn't get the code? Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
