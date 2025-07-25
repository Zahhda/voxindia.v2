"use client";
import React from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";

const CartSidebar = ({ open, onClose }) => {
  const {
    cartItems,
    products,
    getCartAmount,
    updateCartItemQuantity,
    removeFromCart,
  } = useAppContext();
  const router = useRouter();

  const cartArray = Object.entries(cartItems || {});

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const colorMap = {
    White: "#fff",
    Grey: "#808080",
    Anthracite: "#293133",
    Black: "#000",
    Mocca: "#837060",
    Natural: "#E1C699",
    "Natural Black": "#1D1D1B",
    Chocolate: "#7B3F00",
  };

  const renderColorPill = (colorName) => {
    if (!colorName) return null;
    const bgColor = colorMap[colorName] || "#ccc";
    const textColor = ["White", "Natural"].includes(colorName) ? "#000" : "#fff";
    return (
      <div
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold select-none"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          boxShadow: "0 0 3px rgba(0,0,0,0.1)",
          minWidth: "50px",
          justifyContent: "center",
        }}
      >
        <span
          className="w-3 h-3 rounded-full border border-gray-300"
          style={{ backgroundColor: bgColor }}
        />
        {colorName}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black bg-opacity-40 z-[9998] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar */}
      <aside
        style={{
          fontFamily:
            "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
        className={`fixed top-0 right-0 h-full w-[90vw] max-w-md bg-white z-[9999] shadow-2xl rounded-l-xl transform transition-transform duration-500 ease-in-out flex flex-col
        ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b flex-shrink-0">
          <h2 className="text-2xl font-semibold tracking-wide text-gray-900">Your Cart</h2>
          <button
            onClick={onClose}
            aria-label="Close cart sidebar"
            className="text-gray-600 hover:text-gray-900 text-3xl leading-none font-light transition"
          >
            &times;
          </button>
        </div>

        {/* Scrollable cart items */}
        <div className="p-5 overflow-y-auto flex-grow space-y-6">
          {cartArray.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Your cart is empty</p>
          ) : (
            cartArray.map(([key, quantity]) => {
              const [productId, variantId, colorName] = key.split('|');
              const product = products.find((p) => p._id === productId);
              if (!product) return null;

              const variant = product.variants?.find((v) => v._id === variantId) || product.variants?.[0];
              const color = variant?.colors?.find((c) => c.name === colorName) || variant?.colors?.[0];
              const img = color?.image || product.image?.[0];

              const itemPrice = (color?.price ?? product?.offerPrice ?? product?.price) || 0;

              return (
                <div
                  key={key}
                  className="flex gap-4 items-center border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                >
                  {img && (
                    <Image
                      src={img}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover flex-shrink-0"
                      unoptimized
                    />
                  )}
                  <div className="flex-1 flex flex-col gap-1">
                    <p className="font-semibold text-gray-900 text-lg">{product.name}</p>
                    {renderColorPill(colorName)}
                    <p className="text-gray-700 font-semibold mt-1">
                      ₹{(itemPrice * quantity).toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() =>
                          updateCartItemQuantity(key, Math.max(1, quantity - 1))
                        }
                        className="w-8 h-8 rounded border border-gray-300 text-gray-600 font-bold hover:bg-gray-100 transition"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="font-medium min-w-[24px] text-center">{quantity}</span>
                      <button
                        onClick={() => updateCartItemQuantity(key, quantity + 1)}
                        className="w-8 h-8 rounded border border-gray-300 text-gray-600 font-bold hover:bg-gray-100 transition"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>

                      {/* Remove button */}
                      <button
                        onClick={() => removeFromCart(key)}
                        className="ml-auto text-red-600 hover:text-red-800 font-semibold transition"
                        aria-label="Remove item"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer pinned at bottom */}
        <div className="p-5 border-t flex-shrink-0 bg-white">
          <p className="font-semibold text-lg mb-4 text-gray-900">
            Total: ₹{getCartAmount().toFixed(2)}
          </p>
          <button
            onClick={handleCheckout}
            className="w-full bg-[#e80808] text-white py-3 rounded-md hover:bg-red-700 transition font-semibold text-lg"
          >
            Proceed to Checkout
          </button>
        </div>
      </aside>
    </>
  );
};

export default CartSidebar;
