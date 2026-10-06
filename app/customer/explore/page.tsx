'use client';

import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layouts/AppLayout';
import { Search, MapPin, Filter, Star, Clock, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ExplorePage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Explore Businesses</h1>
          <p className="text-muted">Find and book the best verified services near you.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input placeholder="Search services, businesses, or keywords..." className="pl-10 h-12" />
          </div>
          <div className="relative w-full md:w-64">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input placeholder="Location..." className="pl-10 h-12" />
          </div>
          <Button variant="outline" className="h-12 px-6 space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </Button>
        </div>

        {/* Categories (Mini) */}
        <div className="flex items-center space-x-4 overflow-x-auto pb-4 no-scrollbar">
          {['All', 'Barbers', 'Salons', 'Consultants', 'Photographers', 'Clinics'].map((cat) => (
            <Button
              key={cat}
              variant={cat === 'All' ? 'default' : 'outline'}
              className="rounded-full whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Placeholder Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="aspect-[16/9] relative overflow-hidden">
                <img
                  src={`https://picsum.photos/seed/biz-${i}/600/400`}
                  alt="Business"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant="success" className="glass backdrop-blur-md">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">Premium Service Business {i}</h3>
                  <div className="flex items-center space-x-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold text-foreground">4.9</span>
                  </div>
                </div>
                <p className="text-muted text-sm line-clamp-2">
                  High-quality professional services tailored to your needs. Expert team with over 10 years of experience.
                </p>
                <div className="flex items-center text-sm text-muted space-x-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>Lagos, Nigeria</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Open Now</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider font-bold">Starting from</p>
                    <p className="text-lg font-bold text-primary">₦25,000</p>
                  </div>
                  <Link href={`/customer/business/${i}`}>
                    <Button>View Profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
