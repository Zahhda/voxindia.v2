import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Address from '@/models/Address';

export async function POST(req) {
  await connectDB();
  const { userId, fullName, phoneNumber, pincode, area, city, state } = await req.json();

  if (!userId) return NextResponse.json({ success: false, message: 'userId required' }, { status: 400 });

  let address = await Address.findOne({ userId });

  if (address) {
    // Update existing
    address.fullName = fullName;
    address.phoneNumber = phoneNumber;
    address.pincode = pincode;
    address.area = area;
    address.city = city;
    address.state = state;
    await address.save();
  } else {
    // Create new
    await Address.create({ userId, fullName, phoneNumber, pincode, area, city, state });
  }

  return NextResponse.json({ success: true });
}
