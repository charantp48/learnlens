import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F0EA] text-[#0D0D0D] font-body selection:bg-[#F26522] selection:text-white">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
