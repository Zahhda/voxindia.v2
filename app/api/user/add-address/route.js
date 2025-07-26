import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Address from "@/models/Address";
import { verifyToken } from "@/lib/verifyToken";

export async function POST(req) {
  try {
    const decoded = verifyToken(req); // extract userId from JWT
    await connectDB();

    const body = await req.json();
    console.log("Received body:", body);

    // Validate body.address exists
    if (!body.address) {
      throw new Error("Address data missing in request body");
    }

    // Convert pincode string to number
    const addressData = {
      ...body.address,
      pincode: Number(body.address.pincode),
      userId: decoded.userId,
    };

    console.log("Address data to save:", addressData);

    const newAddress = await Address.create(addressData);

    return NextResponse.json({ success: true, address: newAddress });
  } catch (error) {
    console.error("Add address error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
