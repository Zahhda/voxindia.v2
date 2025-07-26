'use client';

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";

export default function OrderSummary() {
  const {
    router,
    getCartCount,
    getCartAmount,
    getToken,
    cartItems,
    setCartItems,
  } = useAppContext();

  const [showModal, setShowModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    gstin: "",
    pincode: "",
    area: "",
    city: "",
    state: "",
  });
  const [loading, setLoading] = useState(false);

  // Load last‐edited and all addresses
  useEffect(() => {
    const raw = localStorage.getItem("user_address");
    let last = null;
    if (raw) {
      last = JSON.parse(raw);
      setForm(last);
      setSelected(last);
    }
    (async () => {
      try {
        const token = await getToken();
        const phone = last?.phoneNumber || "";
        const res = await fetch(
          `/api/user/addresses?phone=${encodeURIComponent(phone)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) setAddresses(data.addresses);
      } catch (e) {
        console.error("fetch addresses:", e);
      }
    })();
  }, [getToken]);

  const handleChange = (k, v) => {
    const u = { ...form, [k]: v };
    setForm(u);
    localStorage.setItem("user_address", JSON.stringify(u));
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phoneNumber || !form.email) {
      return toast.error("Name, phone & email are required");
    }
    try {
      const token = await getToken();
      const res = await fetch("/api/user/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || res.statusText);
      const data = JSON.parse(text);
      setAddresses((prev) => {
        const idx = prev.findIndex((a) => a._id === data.address._id);
        if (idx > -1) {
          prev[idx] = data.address;
          return [...prev];
        }
        return [...prev, data.address];
      });
      setSelected(data.address);
      setForm(data.address);
      toast.success("Address saved");
      setShowModal(false);
    } catch (err) {
      toast.error(err.message || "Save failed");
    }
  };

  const deleteAddress = async (addr) => {
    if (!confirm(`Delete address for ${addr.fullName}?`)) return;
    try {
      const token = await getToken();
      const res = await fetch("/api/user/address", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ _id: addr._id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setAddresses((prev) => prev.filter((a) => a._id !== addr._id));
      if (selected?._id === addr._id) setSelected(null);
      toast.success("Address deleted");
    } catch (e) {
      toast.error(e.message || "Delete failed");
    }
  };

  const selectAddress = (a) => {
    setSelected(a);
    setForm(a);
    localStorage.setItem("user_address", JSON.stringify(a));
  };

  const placeOrder = async () => {
    if (!selected) return toast.error("Select an address first");
    const items = Object.entries(cartItems).map(([k, q]) => {
      const [productId, variantId, colorName] = k.split("|");
      return { productId, variantId, colorName, quantity: q };
    });
    if (!items.length) return toast.error("Cart is empty");

    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/order/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          address: selected,
          paymentMethod: "razorpay",
        }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || res.statusText);
      const data = JSON.parse(text);
      if (!data.success) throw new Error(data.message);
      toast.success("Order placed!");
      setCartItems({});
      router.push("/order-placed");
    } catch (e) {
      toast.error(e.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (amt) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amt);

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-xl font-sans">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Summary</h2>

      {/* Address Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-700">Delivery Address</h3>
          <button
            onClick={() => setShowModal(true)}
            className="text-red-500 hover:underline text-sm"
          >
            + Add / Edit
          </button>
        </div>

        {selected ? (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="font-medium">{selected.fullName}</p>
            <p className="text-sm">{selected.phoneNumber}</p>
            <p className="text-sm">{selected.email}</p>
            <p className="text-sm">
              {selected.area}, {selected.city} — {selected.pincode}
            </p>
            <p className="text-sm">{selected.state}</p>
            {selected.gstin && (
              <p className="text-sm">GSTIN: {selected.gstin}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No address selected</p>
        )}
      </div>

      {/* Scrollable, Removable Saved Addresses */}
      {addresses.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-2">Saved Addresses</h4>
          <ul className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
            {addresses.map((a) => (
              <li
                key={a._id}
                className={`flex justify-between items-start p-2 rounded-lg transition cursor-pointer ${
                  selected?._id === a._id
                    ? "bg-red-50 border-red-400"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => selectAddress(a)}
              >
                <div>
                  <p className="font-semibold">{a.fullName}</p>
                  <p className="text-xs">{a.phoneNumber}</p>
                  <p className="text-xs">{a.area}, {a.city}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAddress(a);
                  }}
                  className="text-gray-400 hover:text-red-600 ml-4"
                  aria-label="Remove address"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price Summary */}
      <div className="border-t pt-4 mb-6 text-gray-700">
        <div className="flex justify-between">
          <span>Items ({getCartCount()})</span>
          <span>{formatINR(getCartAmount())}</span>
        </div>
        <div className="flex justify-between font-semibold mt-1">
          <span>Total</span>
          <span>{formatINR(getCartAmount())}</span>
        </div>
      </div>

      {/* Razorpay Button */}
      <button
        onClick={placeOrder}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition"
      >
        {loading ? "Processing…" : "Pay with Razorpay"}
      </button>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-xl"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4">Add / Edit Address</h3>
            <form onSubmit={saveAddress} className="space-y-3">
              {[
                { k: "fullName", label: "Full Name" },
                { k: "phoneNumber", label: "Phone Number" },
                { k: "email", label: "Email", type: "email" },
                { k: "gstin", label: "GSTIN (opt.)" },
                { k: "pincode", label: "Pin Code" },
                { k: "area", label: "Area & Street" },
                { k: "city", label: "City" },
                { k: "state", label: "State" },
              ].map(({ k, label, type = "text" }) => (
                <input
                  key={k}
                  type={type}
                  placeholder={label}
                  value={form[k] || ""}
                  onChange={(e) => handleChange(k, e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-300 outline-none"
                  required={k !== "gstin"}
                />
              ))}
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-medium"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
