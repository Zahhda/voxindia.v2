import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

export async function POST(request) {
  try {
    await connectDB();

    // --- Guest-friendly auth ---
    let userId = null;
    try {
      const auth = getAuth(request);
      userId = auth?.userId || null;
    } catch (e) {
      userId = null;
    }

    const body = await request.json();
    const { address, items, paymentMethod, totalAmount, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Basic validation
    if (!address || !items || !Array.isArray(items) || items.length === 0 || !paymentMethod || !totalAmount) {
      return NextResponse.json(
        { success: false, message: "Invalid order data" },
        { status: 400 }
      );
    }

    const finalAmount = Number(totalAmount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    let order;

    if (paymentMethod === "cod") {
      order = await Order.create({
        userId,
        address,
        items,
        paymentMethod,
        amount: finalAmount,
        status: "Pending",
      });
    } else {
      // Just save the Razorpay payment data, do not create new order at Razorpay!
      order = await Order.create({
        userId,
        address,
        items,
        paymentMethod,
        amount: finalAmount,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "Paid",
      });
    }

    // Send confirmation email (as before)
    // ...your mailOptions and transporter.sendMail() code here...

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order,
      razorpayOrderId: order.razorpayOrderId || null,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
