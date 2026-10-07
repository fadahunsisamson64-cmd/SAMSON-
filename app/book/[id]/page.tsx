'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layouts/AppLayout';
import { 
  MapPin, 
  Star, 
  Clock, 
  ShieldCheck, 
  Loader2, 
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type Business = {
  id: string;
  business_name: string;
  business_type: string;
  description: string;
  address: string;
  city: string;
  state: string;
  is_verified: boolean;
  verification_status: string;
};

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
};

type BusinessHour = {
  day_of_week: number;
  opening_time: string;
  closing_time: string;
  is_closed: boolean;
};

type BookingStep = 'details' | 'datetime' | 'confirm';

export default function PublicBookingPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Booking Flow State
  const [step, setStep] = useState<BookingStep>('details');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!businessId) return;

    const fetchBusinessData = async () => {
      setLoading(true);
      try {
        // Fetch Business
        const { data: bizData, error: bizError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessId)
          .single();

        if (bizError) throw bizError;
        setBusiness(bizData);

        // Fetch Services
        const { data: svcData, error: svcError } = await supabase
          .from('services')
          .select('*')
          .eq('business_id', businessId)
          .eq('is_active', true);

        if (svcError) throw svcError;
        setServices(svcData || []);

        // Fetch Hours
        const { data: hourData, error: hourError } = await supabase
          .from('business_hours')
          .select('*')
          .eq('business_id', businessId);

        if (hourError) throw hourError;
        setHours(hourData || []);

      } catch (err: any) {
        console.error('Error fetching business details:', err);
        setError('Business not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [businessId]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    const today = new Date();
    const isToday = selectedDate === today.toISOString().split('T')[0];
    const dayHours = hours.find(h => h.day_of_week === dayOfWeek);
    
    let open = "09:00";
    let close = "17:00";
    let isClosed = false;

    if (dayHours) {
      open = dayHours.opening_time;
      close = dayHours.closing_time;
      isClosed = dayHours.is_closed;
    }

    if (isClosed) return [];

    const slots: string[] = [];
    const [startHour, startMin] = open.split(':').map(Number);
    const [endHour, endMin] = close.split(':').map(Number);

    let current = new Date(date);
    current.setHours(startHour, startMin, 0, 0);

    const end = new Date(date);
    end.setHours(endHour, endMin, 0, 0);

    while (current < end) {
      const timeString = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      if (!isToday || (current.getTime() > today.getTime())) {
        slots.push(timeString);
      }
      current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
  }, [selectedDate, hours]);

  const handleCreateBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !business) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }

      const { data, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_id: user.id,
          business_id: business.id,
          service_id: selectedService.id,
          booking_date: selectedDate,
          start_time: selectedTime,
          total_price: selectedService.price,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      router.push(`/customer/bookings/${data.id}?success=true`);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  if (error || !business) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-2xl font-bold">{error || "Business not found"}</h2>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <h1 className="text-4xl font-bold text-foreground">{business.business_name}</h1>
            {business.is_verified && <ShieldCheck className="w-6 h-6 text-primary" />}
          </div>
          <p className="text-muted max-w-2xl mx-auto">{business.description || "Book your next appointment online."}</p>
          <div className="flex items-center justify-center space-x-4 text-sm font-medium">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-primary" />
              {business.city}, {business.state}
            </div>
            <Badge variant="secondary" className="capitalize">{business.business_type}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <AnimatePresence mode="wait">
            {step === 'details' && (
              <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <h2 className="text-2xl font-bold text-center">Select a Service</h2>
                <div className="grid grid-cols-1 gap-4">
                  {services.length > 0 ? (
                    services.map((svc) => (
                      <Card 
                        key={svc.id} 
                        className={cn("hover:border-primary transition-all cursor-pointer group", selectedService?.id === svc.id ? "border-primary bg-primary/5" : "")}
                        onClick={() => { setSelectedService(svc); setStep('datetime'); }}
                      >
                        <CardContent className="p-6 flex justify-between items-center">
                          <div className="space-y-1">
                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{svc.name}</h3>
                            <p className="text-sm text-muted">{svc.duration_minutes} mins • {svc.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-primary">{formatCurrency(svc.price)}</div>
                            <Button size="sm" className="mt-2">Select</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-20 text-muted border-2 border-dashed rounded-2xl">
                      No services available at the moment.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 'datetime' && (
              <motion.div key="datetime" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep('details')}>← Back to Services</Button>
                  <Badge variant="outline">Step 2 of 3</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-bold">1. Choose Date</h3>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(null); }}
                      className="w-full p-4 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold">2. Choose Time</h3>
                    {availableTimeSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableTimeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            onClick={() => setSelectedTime(time)}
                            className="h-12"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed text-muted">
                        No slots for this date.
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  className="w-full h-14 text-lg font-bold" 
                  disabled={!selectedTime}
                  onClick={() => setStep('confirm')}
                >
                  Review Booking <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div key="confirm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep('datetime')}>← Back to Time</Button>
                  <Badge variant="outline">Step 3 of 3</Badge>
                </div>
                <Card className="border-primary/20 shadow-xl overflow-hidden">
                  <CardHeader className="bg-primary/5">
                    <CardTitle>Confirm Your Booking</CardTitle>
                    <CardDescription>Final check of your appointment details.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-xs font-bold uppercase text-muted">Service</span>
                          <p className="text-xl font-bold">{selectedService?.name}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-bold uppercase text-muted">When</span>
                          <p className="text-lg font-medium">{new Date(selectedDate).toLocaleDateString()} at {selectedTime}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-xs font-bold uppercase text-muted">Business</span>
                          <p className="text-xl font-bold">{business.business_name}</p>
                          <p className="text-sm text-muted">{business.city}, {business.state}</p>
                        </div>
                        <div className="pt-4 border-t text-right">
                          <span className="text-muted">Total Price</span>
                          <p className="text-2xl font-bold text-primary">{formatCurrency(selectedService?.price || 0)}</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full h-16 text-xl font-bold rounded-2xl" 
                      onClick={handleCreateBooking}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirm & Schedule"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}
