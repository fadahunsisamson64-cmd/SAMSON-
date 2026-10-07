'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isDashboard = pathname.startsWith('/customer') || 
                      pathname.startsWith('/business') || 
                      pathname.startsWith('/admin');

  if (isDashboard) {
    const role = pathname.startsWith('/admin') ? 'admin' : 
                 pathname.startsWith('/business') ? 'business' : 'customer';

    return (
      <div className="min-h-screen flex bg-background">
        <Sidebar role={role} />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-grow pt-16"
          >
            {children}
          </motion.main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-grow pt-20"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
