// app/api/order/create/route.js (add at top)
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,       // your gmail address
    pass: process.env.GMAIL_APP_PASS,   // app password or OAuth token
  },
});

// ...

export async function POST(request) {
  try {
    await connectDB();

    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { address, items, paymentMethod } = body;

    // Validate as before...

    // Calculate total amount as before...

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
      const razorpayOrder = await razorpay.orders.create({
        amount: finalAmount * 100,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      });
      order = await Order.create({
        userId,
        address,
        items,
        paymentMethod,
        amount: finalAmount,
        razorpayOrderId: razorpayOrder.id,
        status: "Pending",
      });
    }

    // Send confirmation email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: address.email,
      subject: `Order Confirmation - ${order._id}`,
      html: `
        <h2>Thank you for your order!</h2>
        <p>Your order ID is <strong>${order._id}</strong>.</p>
        <p><strong>Name:</strong> ${address.fullName}</p>
        <p><strong>Email:</strong> ${address.email}</p>
        <p><strong>Phone:</strong> ${address.phoneNumber}</p>
        <p><strong>Shipping Address:</strong><br/>
           ${address.area}, ${address.city}, ${address.state} - ${address.pincode}
        </p>
        <p><strong>GSTIN:</strong> ${address.gstin || "N/A"}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
        <p>We will notify you when your order ships.</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending error:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    return NextResponse.json({
      success: true,
      message: "Order placed",
      order,
      razorpayOrderId: order.razorpayOrderId || null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
