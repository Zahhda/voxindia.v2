"use client";

import React from "react";
import { useAppContext } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import OrderSummary from "@/components/OrderSummary";

const COLOR_HEX = {
  White: "#ffffff",
  Grey: "#808080",
  Anthracite: "#293133",
  Black: "#000000",
  Mocca: "#837060",
  Natural: "#E1C699",
  "Natural Black": "#1D1D1B",
  Chocolate: "#7B3F00",
};

const CheckoutPage = () => {
  const { cartItems, products, setCartItems } = useAppContext();

  // Convert cartItems object to array for rendering
  const cartArray = Object.entries(cartItems || {});

  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  // Update quantity and sync via context
  const updateQuantity = (key, newQty) => {
    if (newQty < 1) return;
    const updatedCart = { ...cartItems };
    if (updatedCart[key]) {
      updatedCart[key] = {
        ...updatedCart[key],
        quantity: newQty,
      };
      setCartItems(updatedCart);
    }
  };

  // Remove item and sync via context
  const removeItem = (key) => {
    const updatedCart = { ...cartItems };
    delete updatedCart[key];
    setCartItems(updatedCart);
  };

  return (
    <>
      <Navbar />

      <div className="w-full px-4 md:px-8 pt-16 pb-24 bg-gray-50 min-h-screen flex justify-center">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-[1280px] p-6 md:p-10 flex flex-col md:flex-row gap-8">
          {/* Left: Cart Items */}
          <section className="md:flex-[3]">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3">
              Your Cart Items
            </h2>

            {cartArray.length === 0 ? (
              <p className="text-center text-gray-500 text-lg py-20">
                Your cart is empty.
              </p>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto scrollbar-black pr-2">
                {cartArray.map(([key, item]) => {
                  // Extract quantity safely
                  const quantity = item.quantity ?? 1;
                  const [productId, variantId, colorName] = key.split("|");
                  const product = products.find((p) => p._id === productId);
                  if (!product) return null;

                  const variant =
                    product.variants?.find((v) => v._id === variantId) ||
                    product.variants?.[0];
                  const color =
                    variant?.colors?.find((c) => c.name === colorName) ||
                    variant?.colors?.[0];
                  const img = color?.image || product.image?.[0];
                  const price =
                    color?.price ?? product?.offerPrice ?? product?.price ?? 0;

                  return (
                    <article
                      key={key}
                      className="flex gap-4 md:gap-6 items-center border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      {img && (
                        <Image
                          src={img}
                          alt={product.name}
                          width={100}
                          height={100}
                          className="rounded-lg object-cover flex-shrink-0"
                          unoptimized
                        />
                      )}

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Variant:{" "}
                          <span className="font-medium text-gray-800">
                            {variant?.name ?? "Default"}
                          </span>
                        </p>
                        <p className="text-sm flex items-center gap-2 mt-1">
                          Color:{" "}
                          <span
                            className="inline-block w-5 h-5 rounded-full border border-gray-300"
                            style={{
                              backgroundColor: COLOR_HEX[color?.name] || "#ccc",
                            }}
                            title={color?.name}
                          />
                          <span className="font-medium text-gray-800 truncate">
                            {color?.name ?? "N/A"}
                          </span>
                        </p>

                        <div className="mt-3 flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(key, quantity - 1)}
                            aria-label="Decrease quantity"
                            className="w-8 h-8 rounded border border-gray-300 text-lg font-bold text-gray-700 hover:bg-gray-100 transition"
                          >
                            −
                          </button>
                          <span className="min-w-[24px] text-center font-semibold">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(key, quantity + 1)}
                            aria-label="Increase quantity"
                            className="w-8 h-8 rounded border border-gray-300 text-lg font-bold text-gray-700 hover:bg-gray-100 transition"
                          >
                            +
                          </button>
                          
                     <div className="bg-gray-50 rounded-md shadow px-4 py-2 w-36 text-center select-none">
  <div className="text-xs text-gray-500 mb-1">Per panel</div>
  <div className="font-semibold text-lg text-gray-900">
    {totalPanelSqFt.toFixed(3)} sq.ft
  </div>
</div>

                          <button
                            onClick={() => removeItem(key)}
                            aria-label="Remove item"
                            className="ml-4 text-red-600 font-bold text-xl hover:text-red-800 transition"
                          >
                            ×
                          </button>
                        </div>

                        <p className="mt-3 text-gray-800 font-medium">
                          Price: {formatINR(price)} × {quantity} ={" "}
                          <span className="text-red-600 font-bold">
                            {formatINR(price * quantity)}
                          </span>
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {cartArray.length > 0 && (
              <footer className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center font-semibold text-lg">
                <span>Total:</span>
                <span className="text-red-600">
                  {formatINR(
                    cartArray.reduce((acc, [key, item]) => {
                      const quantity = item.quantity ?? 1;
                      const [productId, variantId, colorName] = key.split("|");
                      const product = products.find((p) => p._id === productId);
                      if (!product) return acc;

                      const variant =
                        product.variants?.find((v) => v._id === variantId) ||
                        product.variants?.[0];
                      const color =
                        variant?.colors?.find((c) => c.name === colorName) ||
                        variant?.colors?.[0];
                      const price =
                        color?.price ?? product?.offerPrice ?? product?.price ?? 0;

                      return acc + price * quantity;
                    }, 0)
                  )}
                </span>
              </footer>
            )}
          </section>

          {/* Right: Order Summary */}
          <aside className="md:flex-[2] bg-white rounded-lg shadow-md p-6 sticky top-24 self-start min-w-[300px]">
            <OrderSummary />
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CheckoutPage;
