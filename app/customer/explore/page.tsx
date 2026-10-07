'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layouts/AppLayout';
import { Search, MapPin, Filter, Star, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

export default function ExplorePage() {
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('businesses')
          .select('*')
          .eq('verification_status', 'approved');

        if (category !== 'All') {
          query = query.ilike('business_type', category);
        }

        if (searchQuery) {
          query = query.or(`business_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error('SUPABASE ERROR (Explore):', fetchError);
          setError(`Database Error: ${fetchError.message}`);
          setBusinesses([]);
        } else {
          setBusinesses(data || []);
          setError(null);
        }
      } catch (err: any) {
        console.error('Unexpected error fetching businesses:', err);
        setError(`System Error: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchBusinesses();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, category]);

  const categories = ['All', 'Barber', 'Salon', 'Consultant', 'Photographer', 'Clinic', 'Other'];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="space-y-4 text-center md:text-left">
          <h1 className="text-3xl font-bold text-foreground">Explore Businesses</h1>
          <p className="text-muted">Find and book the best verified services near you.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input 
              placeholder="Search services, businesses, or keywords..." 
              className="pl-10 h-12" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 px-6 space-x-2 hidden md:flex">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </Button>
        </div>

        {/* Categories (Mini) */}
        <div className="flex items-center space-x-4 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              className="rounded-full whitespace-nowrap"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz) => (
              <Card key={biz.id} className="overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full">
                <div className="aspect-[16/9] relative overflow-hidden bg-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-muted opacity-20 uppercase">
                    {(biz as any).business_name?.charAt(0)}
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="success" className="glass backdrop-blur-md">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-foreground truncate mr-2">{(biz as any).business_name}</h3>
                      <div className="flex items-center space-x-1 text-yellow-500 flex-shrink-0">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold text-foreground">4.9</span>
                      </div>
                    </div>
                    <p className="text-muted text-sm line-clamp-2 min-h-[40px]">
                      {biz.description || "No description provided."}
                    </p>
                    <div className="flex items-center text-sm text-muted space-x-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{biz.city}, {biz.state}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <Link href={`/customer/business/${biz.id}`}>
                      <Button className="w-full">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <Search className="w-16 h-16 text-muted mx-auto opacity-20" />
            <h3 className="text-xl font-bold text-foreground">No businesses available yet</h3>
            <p className="text-muted max-w-xs mx-auto">We&apos;re currently bringing more top-rated businesses to Lumina. Check back soon!</p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setCategory('All'); }}>Clear filters</Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
