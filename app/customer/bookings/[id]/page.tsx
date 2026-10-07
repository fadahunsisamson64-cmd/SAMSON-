'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layouts/AppLayout';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  CreditCard,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { cn, formatDate, formatCurrency } from '@/lib/utils';

export default function BookingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const isSuccess = searchParams.get('success') === 'true';

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select(`
            *,
            business:business_id (id, business_name, address, city, state),
            service:service_id (id, name, duration_minutes)
          `)
          .eq('id', bookingId)
          .single();

        if (fetchError) {
          console.error('SUPABASE ERROR (BookingDetail - primary):', fetchError);
          // Try fallback join names
          const { data: altData, error: altError } = await supabase
            .from('bookings')
            .select(`
              *,
              businesses (id, business_name, address, city, state),
              services (id, name, duration_minutes)
            `)
            .eq('id', bookingId)
            .single();

          if (altError) {
            console.error('SUPABASE ERROR (BookingDetail - alt):', altError);
            setError(`Database Error: ${altError.message} (Code: ${altError.code})`);
          } else {
            setBooking(altData);
            setError(null);
          }
        } else {
          setBooking(data);
          setError(null);
        }
      } catch (err: any) {
        console.error('Unexpected error fetching booking details:', err);
        setError(`System Error: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleCancelBooking = async () => {
    if (!booking || booking.status === 'cancelled') return;
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    setIsCancelling(true);
    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (updateError) throw updateError;
      
      setBooking({ ...booking, status: 'cancelled' });
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-40">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !booking) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">{error || "Booking not found"}</h2>
          <Button onClick={() => router.push('/customer/bookings')}>Back to My Bookings</Button>
        </div>
      </AppLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return <Badge variant="success" className="px-3 py-1">Confirmed</Badge>;
      case 'completed': return <Badge variant="secondary" className="px-3 py-1">Completed</Badge>;
      case 'pending': return <Badge variant="outline" className="px-3 py-1">Pending</Badge>;
      case 'cancelled': return <Badge variant="destructive" className="px-3 py-1">Cancelled</Badge>;
      default: return <Badge variant="outline" className="px-3 py-1 uppercase">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {isSuccess && (
          <div className="bg-green-50 border border-green-100 p-6 rounded-2xl flex items-center space-x-4 animate-in fade-in slide-in-from-top-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-green-900 font-bold text-lg">Booking Successful!</h3>
              <p className="text-green-700">Your appointment has been scheduled. You&apos;ll receive a confirmation email shortly.</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push('/customer/bookings')} className="space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to bookings</span>
          </Button>
          {getStatusBadge(booking.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card className="overflow-hidden border-border">
              <CardHeader className="bg-gray-50 border-b border-border">
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>Booking ID: {booking.id.slice(0, 8)}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">Service</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                          <FileText className="w-4 h-4" />
                        </div>
                        <p className="text-lg font-bold">{booking.service?.name || booking.services?.name}</p>
                      </div>
                      <p className="text-sm text-muted ml-10">{booking.service?.duration_minutes || booking.services?.duration_minutes} minutes</p>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">Date & Time</span>
                      <div className="flex items-center space-x-2 text-foreground font-medium ml-1">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{formatDate(booking.booking_date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-foreground font-medium ml-1">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{booking.start_time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">Payment</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <p className="text-lg font-bold">{formatCurrency(booking.total_price)}</p>
                      </div>
                      <Badge variant="outline" className="ml-10 text-[10px]">PAY AT VENUE</Badge>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">Business</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <p className="text-lg font-bold">{booking.business?.business_name || booking.businesses?.business_name}</p>
                      </div>
                      <p className="text-sm text-muted ml-10">{booking.business?.city || booking.businesses?.city}, {booking.business?.state || booking.businesses?.state}</p>
                    </div>
                  </div>
                </div>

                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                  <div className="pt-8 border-t border-border flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" className="flex-grow">Reschedule</Button>
                    <Button 
                      variant="destructive" 
                      className="flex-grow" 
                      onClick={handleCancelBooking}
                      disabled={isCancelling}
                    >
                      {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                      Cancel Booking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cancellation Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted leading-relaxed">
                  Cancellations made within 24 hours of the appointment time may be subject to a cancellation fee. 
                  Please contact the business directly if you need to make changes to your booking within this window.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                <MapPin className="w-12 h-12 text-primary opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold">{booking.business?.business_name || booking.businesses?.business_name}</h3>
                  <p className="text-sm text-muted leading-snug">
                    {booking.business?.address || booking.businesses?.address}<br />
                    {booking.business?.city || booking.businesses?.city}, {booking.business?.state || booking.businesses?.state}
                  </p>
                </div>
                <Button variant="outline" className="w-full">Get Directions</Button>
                <Link href={`/customer/business/${booking.business?.id || booking.businesses?.id}`}>
                  <Button variant="link" className="w-full text-primary">View Business Profile</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  Contact Support
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  Report an Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
