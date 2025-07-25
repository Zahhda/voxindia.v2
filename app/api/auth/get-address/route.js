import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Address from '@/models/Address';

export async function POST(req) {
  await connectDB();
  const { userId } = await req.json();
  const address = await Address.findOne({ userId });
  return NextResponse.json({ success: true, address });
}
