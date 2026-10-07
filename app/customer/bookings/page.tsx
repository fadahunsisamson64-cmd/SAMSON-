'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Loader2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { formatDate, cn } from '@/lib/utils';
import Link from 'next/link';

export default function MyBookingsPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select(`
            *,
            businesses (id, business_name, address, city, state),
            services (id, name, description)
          `)
          .eq('customer_id', session.user.id)
          .order('booking_date', { ascending: false });

        if (fetchError) {
          console.error('SUPABASE ERROR (MyBookings):', fetchError);
          setError(`Database Error: ${fetchError.message}`);
          setBookings([]);
        } else {
          setBookings(data || []);
          setError(null);
        }
      } catch (err: any) {
        console.error('Unexpected Error fetching bookings:', err);
        setError(`System Error: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'completed': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
          <p className="text-muted">Track and manage your service appointments.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="border-red-100 bg-red-50">
            <CardContent className="p-12 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <p className="text-red-700 font-medium">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow overflow-hidden border-border hover:border-primary/20">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Status vertical bar */}
                    <div className={cn(
                      "w-full h-1 md:w-1 md:h-auto",
                      booking.status === 'confirmed' ? "bg-green-500" :
                      booking.status === 'pending' ? "bg-yellow-500" :
                      booking.status === 'cancelled' ? "bg-red-500" : "bg-gray-300"
                    )} />
                    
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 flex-grow">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                          {booking.businesses?.business_name?.charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-foreground text-lg">{booking.services?.name}</h3>
                          <p className="text-sm text-muted">{booking.businesses?.business_name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 flex-grow max-w-2xl">
                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted">Date</p>
                          <p className="font-medium text-foreground flex items-center">
                            <Calendar className="w-3 h-3 mr-1.5 text-primary" />
                            {formatDate(booking.booking_date)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted">Time</p>
                          <p className="font-medium text-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1.5 text-primary" />
                            {booking.start_time}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted">Status</p>
                          <Badge variant={getStatusColor(booking.status)} className="capitalize">
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted">Price</p>
                          <p className="font-bold text-foreground">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(booking.total_price)}
                          </p>
                        </div>
                      </div>

                      <Link href={`/customer/bookings/${booking.id}`} className="block">
                        <Button variant="outline" className="w-full md:w-auto shadow-sm">Manage</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="p-20 text-center space-y-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-10 h-10 text-muted" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">No bookings yet</h2>
                <p className="text-muted max-w-sm mx-auto">
                  When you book a service, it will appear here. Start by exploring our top-rated businesses.
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
