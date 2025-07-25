import { NextResponse } from 'next/server';
import twilio from 'twilio';
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const otpStore = global.otpStore || (global.otpStore = {});

export async function POST(req) {
  const { phone } = await req.json();

  if (!phone) {
    return NextResponse.json({ success: false, message: 'Phone number required' }, { status: 400 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = otp;

  try {
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Twilio Error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 });
  }
}
