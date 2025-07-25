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

  const cartArray = Object.entries(cartItems || {});

  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const updateQuantity = (key, newQty) => {
    if (newQty < 1) return;
    const updatedCart = { ...cartItems, [key]: newQty };
    setCartItems(updatedCart);
  };

  const removeItem = (key) => {
    const updatedCart = { ...cartItems };
    delete updatedCart[key];
    setCartItems(updatedCart);
  };

  // Increased max height: approx 5 items * 130px + gaps
  const maxCartItemsHeight = 130 * 5 + 16 * 4; // 5 items + 4 gaps

  return (
    <>
      <style>{`
        body, button, input, select, textarea {
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        /* Black scrollbar styles for webkit browsers */
        .scrollbar-black::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-black::-webkit-scrollbar-track {
          background: #f3f4f6; /* Tailwind gray-100 */
        }
        .scrollbar-black::-webkit-scrollbar-thumb {
          background-color: #000000; /* Black */
          border-radius: 9999px;
          border: 2px solid #f3f4f6; /* same as track */
        }
        /* Firefox scrollbar */
        .scrollbar-black {
          scrollbar-width: thin;
          scrollbar-color: #000000 #f3f4f6;
        }
      `}</style>

      <Navbar />

      <div className="w-full px-6 md:px-16 lg:px-2 pt-16 pb-24 bg-gray-50 min-h-screen flex justify-center">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-full p-10 flex gap-12">
          <section
            className="md:flex-[3] flex flex-col rounded-lg"
            style={{
              maxHeight: maxCartItemsHeight + 120, // space for header/footer
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <h2 className="text-3xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3">
              Your Cart Items
            </h2>

            {cartArray.length === 0 ? (
              <p className="text-center text-gray-500 text-lg py-20">
                Your cart is empty.
              </p>
            ) : (
              <div
                className="overflow-y-auto pr-4 flex-grow space-y-6 scrollbar-black"
                style={{ maxHeight: maxCartItemsHeight }}
              >
                {cartArray.map(([key, quantity]) => {
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
                      className="flex gap-6 items-center border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-lg transition"
                    >
                      {img && (
                        <Image
                          src={img}
                          alt={product.name}
                          width={110}
                          height={110}
                          className="rounded-lg object-cover flex-shrink-0"
                          unoptimized
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 mt-1 truncate">
                          Variant:{" "}
                          <span className="font-medium text-gray-800">
                            {variant?.name ?? "Default"}
                          </span>
                        </p>
                        <p className="flex items-center gap-2 mt-1">
                          Color:{" "}
                          <span
                            className="inline-block w-6 h-6 rounded-full border border-gray-300"
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

                          <button
                            onClick={() => removeItem(key)}
                            aria-label="Remove item"
                            className="ml-4 text-red-600 font-bold text-xl hover:text-red-800 transition"
                            title="Remove item"
                          >
                            ×
                          </button>
                        </div>

                        <p className="mt-3 text-gray-800 font-semibold">
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
                    cartArray.reduce((acc, [key, qty]) => {
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

                      return acc + price * qty;
                    }, 0)
                  )}
                </span>
              </footer>
            )}
          </section>

          {/* Right: Order Summary non-scrollable */}
          <aside
            className="md:flex-[2] bg-white rounded-lg shadow-md p-8 sticky top-24 self-start"
            style={{ minWidth: "300px", maxHeight: "none", overflow: "visible" }}
          >
            <OrderSummary />
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CheckoutPage;
