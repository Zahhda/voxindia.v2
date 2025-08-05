const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: false, default: null }, // ✅ fix here
  address: { type: Object, required: true },
  items: [{ product: String, quantity: Number }],
  paymentMethod: { type: String, required: true },
  amount: { type: Number, required: true },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
