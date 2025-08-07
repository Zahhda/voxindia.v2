'use client';

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import { ChevronDown, ChevronUp, Wrench, Truck, ShieldCheck } from "lucide-react";
import toast from 'react-hot-toast';  // <-- added toast import

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

const WhyChooseUs = () => {
  const items = [
    { icon: <Wrench className="w-8 h-8 mb-2 text-black group-hover:scale-110 transition-transform" />, label: "Free Installation" },
    { icon: <Truck className="w-8 h-8 mb-2 text-black group-hover:scale-110 transition-transform" />, label: "Free Shipping PAN India" },
    { icon: <ShieldCheck className="w-8 h-8 mb-2 text-black group-hover:scale-110 transition-transform" />, label: "2 Years Warranty" },
  ];
  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Us</h2>
      <div className="flex flex-col md:flex-row items-center justify-around text-center gap-8">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center group">
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const accordionData = [
  /* Your existing accordionData here */
];

const Accordion = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const toggleAccordion = (i) => {
    setActiveIndex(activeIndex === i ? null : i);
    if (i >= visibleCount - 3 && visibleCount < accordionData.length) {
      setVisibleCount(Math.min(visibleCount + 3, accordionData.length));
    }
  };

  return (
    <div className="max-w-full mt-10 space-y-4 px-4 md:px-8 lg:px-16">
      {accordionData.slice(0, visibleCount).map((item, i) => (
        <div key={item.id} className="border-b border-gray-200 w-full">
          <button
            onClick={() => toggleAccordion(i)}
            className="flex justify-between w-full p-4 bg-gray-100 hover:bg-gray-200 text-left text-lg font-medium text-gray-800 transition-all"
          >
            {item.question}
            {activeIndex === i ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          {activeIndex === i && (
            <div className="p-4 text-gray-600 bg-white whitespace-pre-line transition-all duration-300">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default function ProductPage() {
  const { slug } = useParams();
  const { addToCart, openSidebar } = useAppContext(); // <-- assuming openSidebar exists
  // If you don't have openSidebar in your context, remove it and see alternative below

  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [buyMode, setBuyMode] = useState("panel");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const thumbnailsRef = useRef(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/product/list?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.product) {
          setProductData(data.product);
          const firstColor = data.product.variants?.[0]?.colors?.[0]?.image;
          setMainImage(firstColor || data.product.image?.[0] || "");
        } else {
          setError("Product not found");
        }
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loading />;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  const variants = productData.variants || [];
  const currentVariant = variants[selectedVariantIndex] || {};
  const currentColors = currentVariant.colors || [];
  const currentColor = currentColors[selectedColorIndex] || {};
  const basePrice =
    Number(currentColor.price) ||
    Number(productData.offerPrice) ||
    Number(productData.price) ||
    0;
  const displayPrice = buyMode === "box" ? basePrice * 6 : basePrice;
  const discountPercent =
    productData.price &&
    productData.offerPrice &&
    productData.price > productData.offerPrice
      ? Math.round(
          ((productData.price - productData.offerPrice) / productData.price) * 100
        )
      : 0;
  const variantColorImages = variants.flatMap((v) => v.colors).map((c) => c.image);
  const combinedImages = Array.from(
    new Set([...(productData.image || []), ...variantColorImages])
  );

  const selectVariant = (i) => {
    setSelectedVariantIndex(i);
    setSelectedColorIndex(0);
    setQuantity(1);
    const img = variants[i].colors?.[0]?.image;
    setMainImage(img || productData.image[0]);
  };

  const selectColor = (i) => {
    setSelectedColorIndex(i);
    setQuantity(1);
    const img = currentColors[i]?.image;
    setMainImage(img || productData.image[0]);
  };

  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));
  const incrementQty = () => setQuantity((q) => q + 1);
  const toggleLightbox = () => setIsLightboxOpen((v) => !v);

  const perSqFt = Number(productData.perSqFtPrice);
  const perPanel = Number(productData.perPanelSqFt);
  const totalPanelSqFt = perPanel * quantity;

  // Scroll thumbnails by 100px when arrows clicked
  const scrollThumbnails = (direction) => {
    if (!thumbnailsRef.current) return;
    const scrollAmount = 100;
    if (direction === "left") {
      thumbnailsRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      thumbnailsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleAddToCart = () => {
    addToCart(productData._id, quantity, currentVariant._id, currentColor.name);
    toast.success('Item added successfully');

    // If you have openSidebar method in context, call it here:
    if (openSidebar) {
      openSidebar();
      return;
    }

    // If no openSidebar, fallback to custom event:
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('openCartSidebar'));
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-2 pt-14 space-y-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <div
              onClick={toggleLightbox}
              className="overflow-hidden rounded-lg bg-gray-50 relative w-full h-[450px] group cursor-pointer"
            >
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={productData.name}
                  fill
                  priority
                  className="object-contain bg-white group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 450px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                  No Image
                </div>
              )}
            </div>

            {/* Thumbnails row with navigation buttons */}
            <div className="relative mt-4 flex items-center">
              {/* Left arrow */}
              <button
                onClick={() => scrollThumbnails("left")}
                aria-label="Scroll thumbnails left"
                className="z-20 absolute left-0 bg-white rounded-full shadow-md p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Thumbnails container */}
              <div
                ref={thumbnailsRef}
                className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 scroll-smooth space-x-4 px-10"
                style={{ scrollBehavior: "smooth" }}
              >
                {combinedImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => selectColor(i)}
                    type="button"
                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-transform hover:scale-105 ${
                      mainImage === img ? "border-orange-500" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumb ${i}`}
                      width={80}
                      height={80}
                      className="object-contain bg-white"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>

              {/* Right arrow */}
              <button
                onClick={() => scrollThumbnails("right")}
                aria-label="Scroll thumbnails right"
                className="z-20 absolute right-0 bg-white rounded-full shadow-md p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-4xl font-semibold">{productData.name}</h1>
            <p className="text-lg text-gray-500 mb-4">
              Color: {currentColor.name || "N/A"}
            </p>
            <div className="flex items-center space-x-4 mb-8">
              <span className="text-3xl font-semibold">₹{displayPrice.toFixed(2)}</span>
              <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold select-none">
                {discountPercent > 0 ? `${discountPercent}% OFF` : "5% OFF"}
              </span>
              {discountPercent > 0 && (
                <span className="line-through text-lg text-gray-500">
                  ₹{productData.price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded shadow text-center">
                <div className="text-xs text-gray-600 mb-1">Per sq.ft</div>
                <div className="font-semibold text-lg">
                  ₹{!isNaN(perSqFt) ? perSqFt.toFixed(2) : "N/A"}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded shadow text-center">
                <div className="text-xs text-gray-600 mb-1">Per panel</div>
                <div className="font-semibold text-lg">
                  {!isNaN(perPanel) ? `${perPanel.toFixed(3)} sq.ft` : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <span className="text-sm font-medium">Select Mode:</span>
              <button
                onClick={() => setBuyMode("panel")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  buyMode === "panel" ? "bg-black text-white" : "bg-gray-200 text-black"
                }`}
              >
                By Panel
              </button>
            </div>

            <div className="flex space-x-4 mb-6">
              {variants.map((v, i) => (
                <button
                  key={i}
                  onClick={() => selectVariant(i)}
                  className={`py-2 px-4 border rounded-md font-semibold ${
                    selectedVariantIndex === i
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>

            <div className="flex space-x-4 mb-6 items-center">
              <span className="font-semibold mr-4">Color:</span>
              {currentColors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => selectColor(i)}
                  title={c.name}
                  className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center cursor-pointer ${
                    selectedColorIndex === i ? "ring-2 ring-blue-600" : ""
                  }`}
                  style={{ backgroundColor: COLOR_HEX[c.name] || "#ccc" }}
                >
                  <div className="w-6 h-6 rounded-full" />
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-6 mb-8">
              <div className="flex items-center space-x-4">
                <span className="font-semibold">Quantity:</span>
                <button
                  onClick={decrementQty}
                  className="w-8 h-8 border border-gray-400 rounded text-2xl flex items-center justify-center"
                >
                  −
                </button>
                <span className="text-xl">{quantity}</span>
                <button
                  onClick={incrementQty}
                  className="w-8 h-8 border border-gray-400 rounded text-2xl flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <div className="bg-gray-50 rounded-md shadow px-4 py-2 w-36 text-center">
                <div className="font-semibold text-lg">{totalPanelSqFt.toFixed(3)} sq.ft</div>
              </div>
            </div>

            {/* Updated Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 bg-black text-white rounded hover:bg-gray-900 transition"
            >
              <span className="inline-flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.97-1.58L23 6H6" />
                </svg>
                <span>Add to Cart</span>
              </span>
            </button>

            <WhyChooseUs />
          </div>
        </div>

        <Accordion />
      </div>

      {isLightboxOpen && (
        <div
          onClick={toggleLightbox}
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 cursor-zoom-out"
        >
          <img
            src={mainImage}
            alt="Expanded product"
            className="max-w-full max-h-full rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={toggleLightbox}
            className="absolute top-5 right-5 text-white text-3xl font-bold"
          >
            &times;
          </button>
        </div>
      )}

      <Footer />
    </>
  );
}
