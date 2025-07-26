'use client'
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY;
  const router = useRouter();

  const { user } = useUser();
  const { getToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({}); 
  // cartItems format: { "productId|variantId|colorName": quantity }

  const fetchProductData = async () => {
    try {
      const { data } = await axios.get('/api/product/list');
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUserData = async () => {
    try {
      if (user.publicMetadata.role === 'seller') setIsSeller(true);

      const token = await getToken();
      const { data } = await axios.get('/api/user/data', { headers: { Authorization: `Bearer ${token}` } });

      if (data.success) {
        setUserData(data.user);
        setCartItems(data.user.cartItems || {});
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Helper: create composite key for cart items
  const makeCartKey = (productId, variantId, colorName) => {
    return [productId, variantId, colorName].filter(Boolean).join('|');
  };

  const addToCart = async (productId, quantity = 1, variantId = null, colorName = null) => {
    // if (!user) return toast('Please login', { icon: '⚠️' });

    let cartData = structuredClone(cartItems);
    const key = makeCartKey(productId, variantId, colorName);

    if (cartData[key]) {
      cartData[key] += quantity;
    } else {
      cartData[key] = quantity;
    }

    setCartItems(cartData);

    if (user) {
      try {
        const token = await getToken();
        await axios.post('/api/cart/update', { cartData }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Item added to cart');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const updateCartItemQuantity = async (key, quantity) => {
    let cartData = structuredClone(cartItems);
    if (quantity <= 0) {
      delete cartData[key];
    } else {
      cartData[key] = quantity;
    }
    setCartItems(cartData);

    if (user) {
      try {
        const token = await getToken();
        await axios.post('/api/cart/update', { cartData }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Cart updated');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const removeFromCart = async (key) => {
    let cartData = structuredClone(cartItems);
    if (cartData[key]) {
      delete cartData[key];
      setCartItems(cartData);
      if (user) {
        try {
          const token = await getToken();
          await axios.post('/api/cart/update', { cartData }, { headers: { Authorization: `Bearer ${token}` } });
          toast.success('Item removed from cart');
        } catch (error) {
          toast.error(error.message);
        }
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const key in cartItems) {
      if (cartItems[key] > 0) totalCount += cartItems[key];
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const key in cartItems) {
      const [productId, variantId, colorName] = key.split('|');
      const product = products.find(p => p._id === productId);
      if (!product) continue;

      const variant = product.variants?.find(v => v._id === variantId) || product.variants?.[0];
      const color = variant?.colors?.find(c => c.name === colorName) || variant?.colors?.[0];

      const price = color?.price ?? product?.offerPrice ?? product?.price ?? 0;

      totalAmount += price * cartItems[key];
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const value = {
    user,
    getToken,
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    getCartCount,
    getCartAmount,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
