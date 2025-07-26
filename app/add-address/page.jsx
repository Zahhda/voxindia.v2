'use client'
import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
const token = await getToken(); // your auth token method
const res = await fetch('/api/user/get-address', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const AddAddress = () => {
  const { getToken, router } = useAppContext();

  const [address, setAddress] = useState({

  "fullName": "...",
  "phoneNumber": "...",
  "pincode": "...",
  "area": "...",
  "city": "...",
  "state": "..."


  });

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const { data } = await axios.post('/api/user/add-address', { address }, { headers: { Authorization: `Bearer ${token}` } });

      if (data.success) {
        toast.success(data.message);
        router.push('/profile?tab=addresses');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 bg-white border-r">
          <div className="flex flex-col py-10 px-6 space-y-3">
            <button onClick={() => router.push('/profile?tab=account')} className="text-left px-4 py-2 rounded font-semibold text-white bg-[#e80808]">
              My Account
            </button>
            <button onClick={() => router.push('/profile?tab=addresses')} className="text-left px-4 py-2 rounded font-semibold text-[#e80808] bg-gray-100">
              My Addresses
            </button>
          </div>
        </aside>

        {/* Main Form */}
        <div className="flex-1 px-6 md:px-16 py-16 flex flex-col md:flex-row justify-between">
          <form onSubmit={onSubmitHandler} className="w-full max-w-2xl">
            <p className="text-2xl md:text-3xl text-gray-500">
              Add Shipping <span className="font-semibold text-red-700">Address</span>
            </p>
            <div className="space-y-3 max-w-sm mt-10">
              <input
                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                type="text"
                placeholder="Full name"
                onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                value={address.fullName}
              />
              <input
                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                type="text"
                placeholder="Phone number"
                onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })}
                value={address.phoneNumber}
              />
              <input
                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                type="text"
                placeholder="Pin code"
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                value={address.pincode}
              />
              <textarea
                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500 resize-none"
                rows={4}
                placeholder="Address (Area and Street)"
                onChange={(e) => setAddress({ ...address, area: e.target.value })}
                value={address.area}
              ></textarea>
              <div className="flex space-x-3">
                <input
                  className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                  type="text"
                  placeholder="City/District/Town"
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  value={address.city}
                />
                <input
                  className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                  type="text"
                  placeholder="State"
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  value={address.state}
                />
              </div>
            </div>
            <button type="submit" className="max-w-sm w-full mt-6 bg-red-700 text-white py-3 hover:bg-red-700 uppercase">
              Save address
            </button>
          </form>

          <Image
            className="md:mr-16 mt-16 md:mt-0"
            src={assets.my_location_image}
            alt="my_location_image"
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddAddress;