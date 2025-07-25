"use client";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const OrderSummary = () => {
  const {
    router,
    getCartCount,
    getCartAmount,
    getToken,
    user,
    cartItems,
    setCartItems,
  } = useAppContext();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/get-address", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUserAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createOrder = async () => {
    try {
      if (!user) return toast("Please login to place order", { icon: "⚠️" });
      if (!selectedAddress) return toast.error("Please select an address");

      let cartItemsArray = Object.keys(cartItems).map((key) => ({
        product: key,
        quantity: cartItems[key],
      }));
      cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);
      if (cartItemsArray.length === 0) return toast.error("Cart is empty");

      const token = await getToken();
      const totalAmount = getCartAmount() + Math.floor(getCartAmount() * 0.02);

      if (paymentMethod === "cod") {
        // 🧾 COD Flow
        const { data } = await axios.post(
          "/api/order/create",
          {
            address: selectedAddress._id,
            items: cartItemsArray,
            payment_mode: "COD",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          router.push("/order-placed");
        } else {
          toast.error(data.message);
        }
        return;
      }

      // 💳 Razorpay Online Payment
      const razorpayOrder = await axios.post("/api/razorpay/order", {
        amount: totalAmount,
      });

      if (!razorpayOrder.data.success) {
        return toast.error("Failed to create payment order");
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) return toast.error("Failed to load Razorpay script");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.data.order.amount,
        currency: "INR",
        name: "Voxindia",
        description: "Order Payment",
        order_id: razorpayOrder.data.order.id,
        handler: async function (response) {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

          const confirm = await axios.post(
            "/api/order/create",
            {
              address: selectedAddress._id,
              items: cartItemsArray,
              payment_id: razorpay_payment_id,
              razorpay_order_id,
              signature: razorpay_signature,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (confirm.data.success) {
            toast.success(confirm.data.message);
            setCartItems({});
            router.push("/order-placed");
          } else {
            toast.error("Payment verified but order failed");
          }
        },
        theme: { color: "#f40000" },
        prefill: {
          name: user?.fullName || "Customer",
          email: user?.email,
        },
      };

      const razorpayObject = new window.Razorpay(options);
      razorpayObject.open();
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user]);

  // Helper to format INR currency
  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">Order Summary</h2>
      <hr className="border-gray-500/30 my-5" />

      <div className="space-y-6">
        {/* Address Dropdown */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Address
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Select Address"}
              </span>
              <svg
                className={`w-5 h-5 inline float-right transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-0" : "-rotate-90"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#6B7280"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => setSelectedAddress(address)}
                  >
                    {address.fullName}, {address.area}, {address.city}, {address.state}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Payment Method
          </label>
          <select
            className="w-full border p-2.5 text-gray-700"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="razorpay">Pay Online (Razorpay)</option>
            <option value="cod">Cash on Delivery</option>
          </select>
        </div>

        {/* Promo Code (Optional UI Only) */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">Promo Code</label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
            />
            <button className="bg-red-700 text-white px-9 py-2 hover:bg-red-700">Apply</button>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        {/* Price Summary */}
        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items {getCartCount()}</p>
            <p className="text-gray-800">{formatINR(getCartAmount())}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">Free</p>
          </div>
          <div className="flex justify-between">
            {/* Uncomment and use if needed */}
            {/* <p className="text-gray-600">Tax (2%)</p> */}
            {/* <p className="font-medium text-gray-800">{formatINR(Math.floor(getCartAmount() * 0.02))}</p> */}
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>{formatINR(getCartAmount() + Math.floor(getCartAmount() * 0.02))}</p>
          </div>
        </div>
      </div>

      {/* Place Order Button */}
      <button
        onClick={createOrder}
        className="w-full bg-red-700 text-white py-3 mt-5 hover:bg-red-700"
      >
        Place Order
      </button>
    </div>
  );
};

export default OrderSummary;
