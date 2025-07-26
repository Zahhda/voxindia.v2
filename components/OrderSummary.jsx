"use client";
import { useAppContext } from "@/context/AppContext";
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
  const [showAddressModal, setShowAddressModal] = useState(false);

  // For demo: prefill a random address when modal opens
  const randomDemoAddress = {
    fullName: "John Doe",
    phoneNumber: "9876543210",
    pincode: "560001",
    area: "Demo Area, Test Street",
    city: "Bangalore",
    state: "Karnataka",
  };

  const [newAddress, setNewAddress] = useState(randomDemoAddress);

  // When modal opens, reset form to demo address
  const openAddressModal = () => {
    setNewAddress(randomDemoAddress);
    setShowAddressModal(true);
  };

  // Demo save: just add address locally without API call
  const saveNewAddress = (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !newAddress.fullName ||
      !newAddress.phoneNumber ||
      !newAddress.pincode ||
      !newAddress.area ||
      !newAddress.city ||
      !newAddress.state
    ) {
      return toast.error("Please fill all fields");
    }

    // Add new address to local state list
    const newId = Date.now().toString();
    setUserAddresses((prev) => [...prev, { ...newAddress, _id: newId }]);
    setSelectedAddress({ ...newAddress, _id: newId });
    setShowAddressModal(false);
    toast.success("Address added (demo mode)");
  };

  // Dummy format function
  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
      amount
    );

  // Simulate initial user addresses empty for demo
  useEffect(() => {
    setUserAddresses([]);
  }, []);

  // Simplified createOrder just demo toast (no payment, no login check)
  const createOrder = () => {
    if (!selectedAddress) return toast.error("Please select an address");

    let cartItemsArray = Object.keys(cartItems).map((key) => ({
      product: key,
      quantity: cartItems[key],
    }));
    cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);
    if (cartItemsArray.length === 0) return toast.error("Cart is empty");

    toast.success("Order placed successfully (demo mode)");
    setCartItems({});
    router.push("/order-placed");
  };

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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5 max-h-48 overflow-auto">
                {userAddresses.map((address) => (
                  <li
                    key={address._id}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => {
                      setSelectedAddress(address);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {address.fullName}, {address.area}, {address.city}, {address.state}
                  </li>
                ))}
                <li
                  onClick={openAddressModal}
                  className="px-4 py-2 cursor-pointer text-center text-red-700 font-semibold hover:bg-red-100"
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
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Promo Code
          </label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
              disabled
            />
            <button className="bg-red-700 text-white px-9 py-2 hover:bg-red-700" disabled>
              Apply
            </button>
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
          <div className="flex justify-between"></div>
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

      {/* Address Modal Popup */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded max-w-md w-full relative overflow-auto max-h-[90vh]">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold text-xl"
              onClick={() => setShowAddressModal(false)}
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">Add New Address (Demo)</h3>
            <form onSubmit={saveNewAddress} className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={newAddress.fullName}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, fullName: e.target.value })
                }
                required
                className="w-full border px-3 py-2 rounded outline-none"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newAddress.phoneNumber}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, phoneNumber: e.target.value })
                }
                required
                className="w-full border px-3 py-2 rounded outline-none"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={newAddress.pincode}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, pincode: e.target.value })
                }
                required
                className="w-full border px-3 py-2 rounded outline-none"
              />
              <textarea
                placeholder="Area and Street"
                value={newAddress.area}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, area: e.target.value })
                }
                required
                className="w-full border px-3 py-2 rounded outline-none resize-none"
                rows={3}
              />
              <input
                type="text"
                placeholder="City"
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, city: e.target.value })
                }
                required
                className="w-full border px-3 py-2 rounded outline-none"
              />
              <input
                type="text"
                placeholder="State"
                value={newAddress.state}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, state: e.target.value })
                }
                required
                className="w-full border px-3 py-2 rounded outline-none"
              />
              <button
                type="submit"
                className="w-full bg-red-700 text-white py-2 mt-4 rounded hover:bg-red-800"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
