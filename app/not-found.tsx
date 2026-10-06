'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="relative">
          <h1 className="text-9xl font-black text-primary-soft">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-24 h-24 text-primary opacity-20" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Page not found</h2>
          <p className="text-muted text-lg">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto space-x-2">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto space-x-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </Button>
        </div>
      </div>
      <div className="mt-12 text-sm text-muted">
        <p>© {new Date().getFullYear()} Lumina Booking Platform</p>
      </div>
    </div>
  );
}
