'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { assets } from '@/assets/assets';

export default function AuthModal({ isOpen, onClose, onVerify }) {
  const [step, setStep] = useState('phone');   // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');        // single OTP field
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = e => {
    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
  };
  const isPhoneValid = phone.length === 10;

  const sendOtp = async () => {
    setLoading(true);
    try {
      await axios.post('/api/auth/send-otp', { phone: '+91' + phone });
      toast.success('OTP sent!');
      setStep('otp');
    } catch {
      toast.error('Failed to send OTP');
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (code.length < 6) return toast.error('Enter 6‑digit code');
    setLoading(true);
    try {
      await axios.post('/api/auth/verify-otp', {
        phone: '+91' + phone,
        otp: code,
      });
      toast.success('Verified!');
      sessionStorage.setItem('otp_verified', 'true');
      onVerify();
      setTimeout(onClose, 500);
    } catch {
      toast.error('Invalid OTP');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-96 rounded-2xl p-8 relative shadow-2xl flex flex-col"
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          ✕
        </button>

        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Image src={assets.logo} alt="Logo" width={64} height={64} />
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-semibold text-gray-900 mb-1">
          {step === 'phone' ? 'Enter Phone Number' : 'Enter OTP'}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          {step === 'phone'
            ? "We'll send a code to your number"
            : 'Type the 6‑digit code we sent you'}
        </p>

        {/* PHONE & NAME STEP */}
        {step === 'phone' && (
          <>
            <div className="flex mb-4">
              <div className="bg-gray-100 border-t border-b border-l border-gray-300 px-4 py-2 rounded-l-lg text-gray-700">
                +91
              </div>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="1234567890"
                className="border border-gray-300 rounded-r-lg flex-1 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e80808] transition"
              />
            </div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your Name (optional)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-[#e80808] transition"
            />
          </>
        )}

        {/* OTP STEP: single full-width box */}
        {step === 'otp' && (
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter OTP"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#e80808] transition"
          />
        )}

        {/* Button */}
        <button
          onClick={step === 'phone' ? sendOtp : verifyOtp}
          disabled={
            loading ||
            (step === 'phone' ? !isPhoneValid : code.length < 6)
          }
          className={`w-full py-3 rounded-lg text-white font-medium transition
            ${loading
              ? 'bg-red-400 cursor-wait'
              : 'bg-[#e80808] hover:bg-[#cc0606] focus:ring-2 focus:ring-offset-1 focus:ring-[#e80808]'}
          `}
        >
          {loading
            ? step === 'phone'
              ? 'Sending...'
              : 'Verifying...'
            : step === 'phone'
            ? 'Send Code'
            : 'Verify OTP'}
        </button>
      </motion.div>
    </div>
  );
}
