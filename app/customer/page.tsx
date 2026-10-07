'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Star, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    saved: 0,
  });
  const [nextBooking, setNextBooking] = useState<any>(null);
  const [savedBusinesses, setSavedBusinesses] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        setUserData(session.user);
        const userId = session.user.id;

        // Fetch Stats
        const [upcomingRes, completedRes, savedRes] = await Promise.all([
          supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('customer_id', userId).in('status', ['confirmed', 'pending']),
          supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('customer_id', userId).eq('status', 'completed'),
          supabase.from('saved_businesses').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        ]);

        setStats({
          upcoming: upcomingRes.count || 0,
          completed: completedRes.count || 0,
          saved: savedRes.count || 0,
        });

        // Fetch Next Appointment
        const { data: nextBookingData, error: nextError } = await supabase
          .from('bookings')
          .select(`
            *,
            businesses (id, business_name, address, city, state),
            services (id, name)
          `)
          .eq('customer_id', userId)
          .in('status', ['confirmed', 'pending'])
          .gte('booking_date', new Date().toISOString().split('T')[0])
          .order('booking_date', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (nextError) {
          console.error('SUPABASE ERROR (Dashboard NextBooking):', nextError);
        } else {
          setNextBooking(nextBookingData);
        }

        // Fetch Saved Businesses
        const { data: savedData } = await supabase
          .from('saved_businesses')
          .select(`
            id,
            businesses (id, business_name, business_type)
          `)
          .eq('user_id', userId)
          .limit(3);

        setSavedBusinesses(savedData || []);

      } catch (err: any) {
        console.error('Unexpected Error fetching dashboard data:', err);
        setError(`Unexpected Error: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted">Loading your dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-red-900">Something went wrong</h2>
            <p className="text-red-700">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const firstName = userData?.user_metadata?.full_name?.split(' ')[0] || 'User';

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {firstName}</h1>
            <p className="text-muted">Manage your bookings and explore new services.</p>
          </div>
          <Link href="/customer/explore">
            <Button size="lg">
              <Calendar className="mr-2 w-4 h-4" />
              New Booking
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted">Upcoming Bookings</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.upcoming}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted">Completed</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.completed}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted">Saved Businesses</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.saved}</p>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Bookings Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Next Appointment</h2>
                <Link href="/customer/bookings">
                  <Button variant="link" className="text-primary p-0">View All</Button>
                </Link>
              </div>
              
              {nextBooking ? (
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-xl bg-primary-soft flex items-center justify-center text-primary font-bold text-2xl uppercase">
                          {nextBooking.businesses?.business_name?.charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg text-foreground">{nextBooking.services?.name}</h3>
                          <p className="text-muted flex items-center text-sm">
                            <MapPin className="w-3 h-3 mr-1" />
                            {nextBooking.businesses?.business_name}, {nextBooking.businesses?.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="font-bold text-foreground">{formatDate(nextBooking.booking_date)}</p>
                          <p className="text-sm text-muted">
                            {nextBooking.start_time}
                          </p>
                        </div>
                        <Link href={`/customer/bookings/${nextBooking.id}`}>
                          <Button variant="outline">Manage</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed border-2">
                  <CardContent className="p-12 text-center space-y-4">
                    <Calendar className="w-12 h-12 text-muted mx-auto opacity-20" />
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">No upcoming appointments</p>
                      <p className="text-sm text-muted text-pretty max-w-xs mx-auto">
                        You don&apos;t have any scheduled appointments. Explore businesses to book your first service!
                      </p>
                    </div>
                    <Link href="/customer/explore">
                      <Button variant="outline" size="sm">Explore Businesses</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Recommended for you</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* For now, we'll show a placeholder or fetch recent top businesses. 
                    Since the requirement says "No fake data", if we don't have a recommendation engine, 
                    we can just show a prompt to explore. */}
                <Card className="sm:col-span-2 bg-gray-50 border-none">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted italic">Explore more businesses to see personalized recommendations here.</p>
                    <Link href="/customer/explore">
                      <Button variant="link" className="text-primary mt-2">Browse all businesses</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Saved Businesses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedBusinesses.length > 0 ? (
                  savedBusinesses.map((item) => (
                    <Link 
                      key={item.id} 
                      href={`/customer/business/${item.businesses.id}`}
                      className="flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold text-xs">
                          {item.businesses.business_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{item.businesses.business_name}</p>
                          <p className="text-xs text-muted">{item.businesses.business_type}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-sm text-muted">No saved businesses yet.</p>
                    <Link href="/customer/explore">
                      <Button variant="outline" size="sm" className="w-full">Explore</Button>
                    </Link>
                  </div>
                )}
                
                {savedBusinesses.length > 0 && (
                  <Link href="/customer/saved">
                    <Button variant="outline" className="w-full mt-2">View All Saved</Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="bg-primary text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <CardContent className="p-6 relative z-10 space-y-4">
                <ShieldCheck className="w-8 h-8" />
                <h3 className="font-bold text-xl">Lumina Pro</h3>
                <p className="text-primary-soft text-sm">
                  Upgrade to Pro to get early access to top providers and exclusive discounts.
                </p>
                <Button variant="glass" className="w-full">Upgrade Now</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
