import { NextResponse } from 'next/server';

const otpStore = global.otpStore || {};

export async function POST(req) {
  const { phone, otp } = await req.json();

  if (!phone || !otp) {
    return NextResponse.json({ success: false, message: 'Phone and OTP required' }, { status: 400 });
  }

  if (otpStore[phone] === otp) {
    delete otpStore[phone]; // Remove OTP after success
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 401 });
}
