'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Loader2, Calendar, Clock, User, Phone, Check, X, MoreVertical } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function BusinessBookingsPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return;

        const { data: business } = await supabase
          .from('businesses')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (business) {
          setBusinessId(business.id);
          const { data, error } = await supabase
            .from('bookings')
            .select(`
              *,
              customer:customer_id (id, full_name, phone, email),
              service:service_id (id, name, duration_minutes)
            `)
            .eq('business_id', business.id)
            .order('booking_date', { ascending: false });

          if (error) throw error;
          setBookings(data || []);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw error;
      
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b));
      toast({ title: "Status Updated", description: `Booking marked as ${status}.` });
    } catch (err) {
      console.error('Error updating booking status:', err);
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'completed': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      case 'rejected': return 'destructive';
      default: return 'outline';
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

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Bookings Management</h1>
            <p className="text-muted">View and manage all appointments for your business.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className={cn(
                      "w-full h-1 md:w-1.5 md:h-auto",
                      booking.status === 'confirmed' ? "bg-green-500" :
                      booking.status === 'pending' ? "bg-yellow-500" :
                      booking.status === 'cancelled' ? "bg-red-500" : "bg-gray-300"
                    )} />
                    
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 flex-grow">
                      <div className="flex items-center space-x-4 min-w-[240px]">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {(booking.customer?.full_name || 'U').charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-foreground">{booking.customer?.full_name || 'Guest Customer'}</h3>
                          <p className="text-xs text-muted flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {booking.customer?.phone || 'No phone provided'}
                          </p>
                          <p className="text-sm font-medium text-primary">{booking.service?.name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-grow max-w-xl">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Date & Time</p>
                          <p className="text-sm font-medium flex items-center">
                            <Calendar className="w-3 h-3 mr-1.5 text-primary" />
                            {formatDate(booking.booking_date)}
                          </p>
                          <p className="text-sm text-muted flex items-center">
                            <Clock className="w-3 h-3 mr-1.5" />
                            {booking.start_time}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Status</p>
                          <Badge variant={getStatusColor(booking.status)} className="capitalize">
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 hidden md:block">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Price</p>
                          <p className="text-sm font-bold">${booking.total_price}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleUpdateStatus(booking.id, 'confirmed')}>
                              <Check className="w-4 h-4 mr-1" /> Confirm
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleUpdateStatus(booking.id, 'rejected')}>
                              <X className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button size="sm" onClick={() => handleUpdateStatus(booking.id, 'completed')}>
                            Complete
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'no_show')}>Mark as No-show</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'cancelled')} className="text-destructive">Cancel Booking</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-20 text-center space-y-4 border-2 border-dashed rounded-2xl">
              <Calendar className="w-12 h-12 mx-auto opacity-10" />
              <p className="text-muted">No bookings found for your business yet.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
