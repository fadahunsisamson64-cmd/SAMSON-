'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Search, 
  Heart, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  ShieldCheck,
  CreditCard,
  Briefcase,
  Clock,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface SidebarProps {
  role: 'customer' | 'business' | 'admin';
}

const Sidebar = ({ role }: SidebarProps) => {
  const pathname = usePathname();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserData(user || null);
    };
    fetchUser();
  }, []);

  const menuItems = {
    customer: [
      { name: 'Dashboard', href: '/customer', icon: LayoutDashboard },
      { name: 'Explore', href: '/customer/explore', icon: Search },
      { name: 'My Bookings', href: '/customer/bookings', icon: Calendar },
      { name: 'Saved Businesses', href: '/customer/saved', icon: Heart },
      { name: 'Notifications', href: '/customer/notifications', icon: Bell },
      { name: 'Profile & Security', href: '/customer/profile', icon: User },
    ],
    business: [
      { name: 'Overview', href: '/business', icon: LayoutDashboard },
      { name: 'Profile', href: '/business/profile', icon: Briefcase },
      { name: 'Services', href: '/business/services', icon: Settings },
      { name: 'Working Hours', href: '/business/hours', icon: Clock },
      { name: 'Bookings', href: '/business/bookings', icon: Calendar },
      { name: 'Payments', href: '/business/payments', icon: CreditCard },
      { name: 'Reviews', href: '/business/reviews', icon: Star },
      { name: 'Verification', href: '/business/verification', icon: ShieldCheck },
    ],
    admin: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Businesses', href: '/admin/businesses', icon: Briefcase },
      { name: 'Verification', href: '/admin/verification', icon: ShieldCheck },
      { name: 'Users', href: '/admin/users', icon: User },
      { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    ]
  };

  const currentMenu = menuItems[role] || [];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-border h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">L</div>
          <span className="text-xl font-bold tracking-tight text-foreground">Lumina</span>
        </Link>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {currentMenu.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                active 
                  ? "bg-primary-soft text-primary" 
                  : "text-muted hover:bg-gray-50 hover:text-foreground"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={cn("w-5 h-5", active ? "text-primary" : "text-muted group-hover:text-primary")} />
                <span>{item.name}</span>
              </div>
              {active && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border space-y-4">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold">
            {userData?.user_metadata?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">
              {userData?.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-muted truncate">
              {userData?.email}
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
