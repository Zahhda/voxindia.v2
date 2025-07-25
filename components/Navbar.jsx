'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { assets, BoxIcon, HomeIcon } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import { useClerk, useUser, UserButton } from '@clerk/nextjs';
import { Menu, X, Heart as HeartIcon, ShoppingBag as BagOpenIcon, User as UserIcon } from 'lucide-react';
import CartSidebar from '@/components/CartSidebar';
import AuthModal from '@/context/AuthModal';

export default function Navbar() {
  const { isSeller, router, cartItems } = useAppContext();
  const { openSignIn } = useClerk();
  const { user: clerkUser } = useUser();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // New pressed states for icons
  const [pressedWishlist, setPressedWishlist] = useState(false);
  const [pressedCart, setPressedCart] = useState(false);
  const [pressedUser, setPressedUser] = useState(false);

  const cartCount = Object.values(cartItems || {}).reduce((a, b) => a + b, 0);
  const wishlistCount = 0; // placeholder

  useEffect(() => {
    if (sessionStorage.getItem('otp_verified') === 'true') {
      setIsOtpVerified(true);
    }
  }, []);

  const handleVerify = () => {
    sessionStorage.setItem('otp_verified', 'true');
    setIsOtpVerified(true);
    setShowAuthModal(false);
    openSignIn();
  };

  // Helper to handle press styling
  const handlePress = (setPressed) => {
    setPressed(true);
    setTimeout(() => setPressed(false), 200); // remove effect after 200ms
  };

  return (
    <>
      <nav className="flex items-center justify-between px-4 md:px-16 py-2 border-b bg-white z-10">
        {/* Logo (smaller) */}
        <div className="cursor-pointer" onClick={() => router.push('/')}>
          <Image src={assets.logo} alt="Logo" width={80} height={24} />
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="hover:text-gray-900 font-medium">Linerio</Link>
          <Link href="/contact" className="hover:text-gray-900 font-medium">Contact</Link>
          {isSeller && (
            <button
              onClick={() => router.push('/seller')}
              className="text-xs border px-4 py-1.5 rounded-full"
            >
              Seller Dashboard
            </button>
          )}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          {/* Wishlist using HeartIcon */}
          <button
            onClick={() => {
              handlePress(setPressedWishlist);
              // existing wishlist logic here (if any)
            }}
            className={`relative text-gray-600 hover:text-red-600 hidden sm:block
              ${pressedWishlist ? 'bg-gray-200 bg-opacity-40 rounded-full p-1' : 'p-0'}
            `}
          >
            <HeartIcon className="h-6 w-6 stroke-2" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart using BagOpenIcon (ShoppingBag alias) */}
          <button
            onClick={() => {
              handlePress(setPressedCart);
              setIsCartOpen(true);
            }}
            className={`relative text-gray-600 hover:text-gray-900
              ${pressedCart ? 'bg-gray-200 bg-opacity-40 rounded-full p-1' : 'p-0'}
            `}
          >
            <BagOpenIcon className="h-6 w-6 stroke-2" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* User / Clerk Sign‑In */}
          {clerkUser ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="Home"
                  labelIcon={<HomeIcon />}
                  onClick={() => router.push('/')} />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="Products"
                  labelIcon={<BoxIcon />}
                  onClick={() => router.push('/all-products')} />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="Cart"
                  labelIcon={<BagOpenIcon />}
                  onClick={() => router.push('/cart')} />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="My Orders"
                  labelIcon={<BoxIcon />}
                  onClick={() => router.push('/my-orders')} />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <button
              onClick={() => {
                handlePress(setPressedUser);
                if (!isOtpVerified) setShowAuthModal(true);
                else openSignIn();
              }}
              className={`text-gray-600 hover:text-gray-900
                ${pressedUser ? 'bg-gray-200 bg-opacity-40 rounded-full p-1' : 'p-0'}
              `}
              aria-label="Account"
            >
              <UserIcon className="h-6 w-6 stroke-2" />
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-gray-600 hover:text-gray-900" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 p-4">
          <div className="flex justify-between items-center mb-6">
            <Image src={assets.logo} alt="Logo" width={80} height={24} />
            <button onClick={() => setMobileMenuOpen(false)} className="text-gray-600 hover:text-gray-900">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col gap-6">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">Home</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">Contact</Link>
            {isSeller && (
              <button
                onClick={() => { router.push('/seller'); setMobileMenuOpen(false); }}
                className="text-lg font-medium border px-4 py-1.5 rounded-full"
              >
                Seller Dashboard
              </button>
            )}
          </nav>
          <div className="mt-8 border-t pt-6 flex flex-col gap-6">
            <button className="flex items-center gap-2 text-lg text-gray-600 hover:text-red-600" onClick={() => { setMobileMenuOpen(false); }}>
              <HeartIcon className="h-6 w-6 stroke-2" /> Wishlist
            </button>
            <button className="flex items-center gap-2 text-lg text-gray-600 hover:text-gray-900" onClick={() => { setIsCartOpen(true); setMobileMenuOpen(false); }}>
              <BagOpenIcon className="h-6 w-6 stroke-2" /> Cart ({cartCount})
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (!isOtpVerified) setShowAuthModal(true);
                else openSignIn();
              }}
              className="flex items-center gap-2 text-lg text-gray-600 hover:text-gray-900"
            >
              <UserIcon className="h-6 w-6 stroke-2" /> {clerkUser ? 'My Account' : 'Sign In'}
            </button>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar open={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onVerify={handleVerify} />
      )}
    </>
  );
}
