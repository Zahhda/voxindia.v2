import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Address from '@/models/Address';
import { verifyToken } from '@/lib/verifyToken';

export async function GET(req) {
  try {
    const decoded = verifyToken(req);
    await connectDB();
    const addresses = await Address.find({ userId: decoded.userId });
    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Unauthorized' }, { status: 401 });
  }
}
