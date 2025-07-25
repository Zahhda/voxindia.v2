import { getAuth } from "@clerk/nextjs/server";
import authSeller from "@/lib/authSeller";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ success: false, message: "Not authorized" });

    const isSeller = await authSeller(userId);
    if (!isSeller) return NextResponse.json({ success: false, message: "Not authorized" });

    const body = await request.json();

    const {
      name,
      description,
      category,
      price,
      offerPrice,
      perSqFtPrice,
      perPanelSqFt,
      imageUrls,      // ✅ List of main image URLs
      variants        // ✅ Variants already include Cloudinary URLs
    } = body;

    await connectDB();

    const newProduct = await Product.create({
      userId,
      name,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
      perSqFtPrice: Number(perSqFtPrice),
      perPanelSqFt: Number(perPanelSqFt),
      image: imageUrls,    // ✅ No need to upload here
      variants,            // ✅ Already has image URLs
      date: Date.now(),
    });

    return NextResponse.json({ success: true, message: "Product added successfully", newProduct });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Failed to add product" });
  }
}
