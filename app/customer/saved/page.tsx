'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Search, MapPin, Star, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SavedBusinessesPage() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error: fetchError } = await supabase
          .from('saved_businesses')
          .select(`
            id,
            businesses (id, business_name, description, address, state, city)
          `)
          .eq('user_id', session.user.id);

        if (fetchError) throw fetchError;
        setSaved(data || []);
      } catch (err: any) {
        console.error('Error fetching saved businesses:', err);
        setError('Could not load your saved businesses.');
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Saved Businesses</h1>
          <p className="text-muted">Your curated list of favorite service providers.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="border-red-100 bg-red-50">
            <CardContent className="p-12 text-center space-y-4">
              <p className="text-red-700 font-medium">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        ) : saved.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {saved.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-[16/9] relative overflow-hidden bg-gray-100">
                    <div className="absolute inset-0 flex items-center justify-center text-4xl text-muted opacity-20 font-bold uppercase">
                       {(item.businesses as any).business_name?.charAt(0)}
                    </div>
                   <div className="absolute top-4 right-4">
                    <Badge variant="success" className="glass backdrop-blur-md">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-foreground truncate mr-2">{(item.businesses as any).business_name}</h3>
                    <div className="flex items-center space-x-1 text-yellow-500 flex-shrink-0">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold text-foreground">4.9</span>
                    </div>
                  </div>
                  <p className="text-muted text-sm line-clamp-2 min-h-[40px]">
                    {item.businesses.description || "Professional service provider on Lumina."}
                  </p>
                  <div className="flex items-center text-sm text-muted space-x-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{item.businesses.address || "N/A"}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
                    <Link href={`/customer/business/${item.businesses.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">View Profile</Button>
                    </Link>
                    <Link href={`/customer/business/${item.businesses.id}`} className="flex-1">
                      <Button className="w-full">Book Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="p-20 text-center space-y-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-muted">
                <Heart className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Nothing saved yet</h2>
                <p className="text-muted max-w-sm mx-auto">
                  Save businesses you love to quickly access them later for booking.
                </p>
              </div>
              <Link href="/customer/explore">
                <Button size="lg">Explore Businesses</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
