'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Calendar, Search, User, LogIn, Briefcase, Settings, Bell, ShieldCheck, Heart, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push('/');
  };

  const navLinks = [
    { name: 'Explore', href: '/customer/explore', icon: Search },
    { name: 'My Bookings', href: '/customer/bookings', icon: Calendar },
    { name: 'Saved', href: '/customer/saved', icon: Heart },
  ];

  const isActive = (path: string) => pathname === path;

  const dashboardLink = user?.user_metadata?.role === 'admin' 
    ? '/admin' 
    : user?.user_metadata?.role === 'business' 
    ? '/business' 
    : '/customer';

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3 md:px-8",
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-border/40" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Lumina</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center space-x-1.5",
                isActive(link.href) ? "text-primary" : "text-muted"
              )}
            >
              <link.icon className="w-4 h-4" />
              <span>{link.name}</span>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Link href={dashboardLink}>
                <Button variant="ghost" size="sm" className="space-x-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm" className="shadow-lg shadow-primary/20">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-muted hover:text-primary transition-colors focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-border md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                    isActive(link.href) ? "bg-primary-soft text-primary font-bold" : "text-muted hover:bg-gray-50"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium text-lg">{link.name}</span>
                </Link>
              ))}
              <hr className="border-border" />
              <div className="flex flex-col space-y-3 pt-2">
                {user ? (
                  <>
                    <Link href={dashboardLink} onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start space-x-3 h-12">
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="text-lg">Dashboard</span>
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start space-x-3 text-red-500 hover:text-red-600 hover:bg-red-50 h-12"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="text-lg">Sign Out</span>
                    </Button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full h-12 text-lg">Login</Button>
                    </Link>
                    <Link href="/auth/sign-up" onClick={() => setIsOpen(false)}>
                      <Button className="w-full h-12 text-lg shadow-lg shadow-primary/20">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
