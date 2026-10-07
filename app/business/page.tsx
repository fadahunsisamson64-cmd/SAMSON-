'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Calendar, Users, DollarSign, ArrowUpRight, Clock, Star, ShieldCheck, Loader2, Store } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function BusinessDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    bookings: 0,
    customers: 0,
    rating: 4.9,
    totalServices: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        // Use getUser() for better security as requested
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return;

        // Fetch business where owner_id matches user.id
        const { data: biz, error: bizError } = await supabase
          .from('businesses')
          .select('id, is_verified, business_name, verification_status')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (bizError) throw bizError;

        if (biz) {
          setBusiness(biz);
          
          // Fetch real stats using parallel queries
          const [bookingsRes, paymentsRes, servicesRes, reviewsRes] = await Promise.all([
            // Bookings count and recent bookings
            supabase
              .from('bookings')
              .select(`
                id, 
                customer_id, 
                booking_date, 
                start_time, 
                total_price, 
                status, 
                service:service_id (name), 
                customer:customer_id (full_name)
              `, { count: 'exact' })
              .eq('business_id', biz.id)
              .order('booking_date', { ascending: false }),
            
            // Completed payments for revenue
            supabase
              .from('payments')
              .select('amount')
              .eq('business_id', biz.id)
              .eq('status', 'completed'),
            
            // Total services count
            supabase
              .from('services')
              .select('id', { count: 'exact' })
              .eq('business_id', biz.id),

            // Average rating
            supabase
              .from('reviews')
              .select('rating')
              .eq('business_id', biz.id)
          ]);

          const totalRevenue = (paymentsRes.data || []).reduce((acc, curr) => acc + curr.amount, 0);
          const ratings = reviewsRes.data || [];
          const avgRating = ratings.length > 0 
            ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length 
            : 0;
          
          setStats({
            revenue: totalRevenue,
            bookings: bookingsRes.count || 0,
            customers: new Set((bookingsRes.data || []).map(b => b.customer_id)).size,
            rating: parseFloat(avgRating.toFixed(1)),
            totalServices: servicesRes.count || 0
          });

          setRecentBookings((bookingsRes.data || []).slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching business dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-40">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const noBusiness = !business;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {noBusiness ? (
          <Card className="border-dashed border-2 bg-primary/5">
            <CardContent className="p-12 text-center space-y-6">
              <Store className="w-16 h-16 text-primary mx-auto opacity-20" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Welcome to Lumina!</h2>
                <p className="text-muted max-w-md mx-auto">
                  You haven&apos;t set up your business profile yet. Complete your profile to start accepting bookings.
                </p>
              </div>
              <Link href="/business/profile">
                <Button size="lg" className="rounded-full px-12 shadow-lg shadow-primary/20">
                  Set Up My Business
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-foreground">Business Dashboard</h1>
                <p className="text-muted">Manage your services, bookings, and revenue.</p>
              </div>
              <div className="flex items-center space-x-3">
                {business.is_verified && (
                  <Badge variant="success" className="h-8 px-4 flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Verified Business
                  </Badge>
                )}
                <Link href="/business/hours">
                  <Button variant="outline">
                    <Clock className="mr-2 w-4 h-4" />
                    Set Hours
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted">Total Revenue</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.revenue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted">Total Bookings</p>
                    <p className="text-2xl font-bold text-foreground">{stats.bookings}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted">Customers</p>
                    <p className="text-2xl font-bold text-foreground">{stats.customers}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted">Total Services</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalServices}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
                    <Store className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Bookings</CardTitle>
                  <Link href="/business/bookings">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    {recentBookings.length > 0 ? (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-border bg-gray-50 text-xs font-bold uppercase tracking-wider text-muted">
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {recentBookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-sm">
                                {(booking.customer as any)?.full_name || 'Guest User'}
                              </td>
                              <td className="px-6 py-4 text-sm">{(booking.service as any)?.name}</td>
                              <td className="px-6 py-4 text-sm text-muted">{formatDate(booking.booking_date)}, {booking.start_time}</td>
                              <td className="px-6 py-4">
                                <Badge variant={booking.status === 'confirmed' ? 'success' : 'outline'} className="text-[10px] capitalize">
                                  {booking.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-20 text-center space-y-4">
                        <Calendar className="w-12 h-12 text-muted mx-auto opacity-20" />
                        <p className="text-muted">No recent bookings found.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-8">
                <Card className="bg-foreground text-white">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-bold text-lg">Your Booking Link</h3>
                    <p className="text-gray-400 text-sm">
                      Share this link with your customers to accept bookings online.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Input 
                        readOnly 
                        value={typeof window !== 'undefined' ? `${window.location.origin}/book/${business.id}` : ''} 
                        className="bg-white/10 border-white/20 text-white text-xs h-9"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-white/20 text-white hover:bg-white/10"
                          onClick={() => {
                            const link = `${window.location.origin}/book/${business.id}`;
                            navigator.clipboard.writeText(link);
                            toast({
                              title: 'Link Copied',
                              description: 'Booking link copied to clipboard.',
                            });
                          }}
                        >
                          Copy Link
                        </Button>
                        <Link href={`/book/${business.id}`} target="_blank" className="w-full">
                          <Button variant="glass" size="sm" className="w-full">Preview</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary text-white">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-bold text-lg">Need Help?</h3>
                    <p className="text-primary-soft text-sm">
                      Our support team is available 24/7 to help you manage your business better.
                    </p>
                    <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
