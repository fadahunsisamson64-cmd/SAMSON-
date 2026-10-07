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
  ArrowLeft, 
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
  phone: string;
  email: string;
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

export default function BusinessDetailPage() {
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
        // 1. Fetch Business
        const { data: bizData, error: bizError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessId)
          .single();

        if (bizError) throw bizError;
        setBusiness(bizData);

        // 2. Fetch Services
        const { data: svcData, error: svcError } = await supabase
          .from('services')
          .select('*')
          .eq('business_id', businessId)
          .eq('is_active', true);

        if (svcError) throw svcError;
        setServices(svcData || []);

        // 3. Fetch Business Hours
        const { data: hourData, error: hourError } = await supabase
          .from('business_hours')
          .select('*')
          .eq('business_id', businessId);

        if (hourError) throw hourError;
        setHours(hourData || []);

      } catch (err: any) {
        console.error('Error fetching business details:', err);
        setError('Failed to load business details.');
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
      
      // If today, only show future times
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
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
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

      // Success
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
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted">
          <Link href="/customer/explore" className="hover:text-primary transition-colors">Explore</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{(business as any).business_name}</span>
        </div>

        {/* Hero Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-4xl font-bold text-foreground">{(business as any).business_name}</h1>
                {business.is_verified && (
                  <Badge variant="success" className="h-6">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-muted">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                  <span className="font-bold text-foreground">4.9</span>
                  <span className="ml-1">(120+ reviews)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{business.city}, {business.state}</span>
                </div>
                <div className="flex items-center">
                  <Badge variant="secondary" className="capitalize">{business.business_type}</Badge>
                </div>
              </div>
            </div>
            
            {step === 'details' && (
              <div className="flex space-x-3">
                <Button variant="outline" className="rounded-full">Save Business</Button>
                <Button className="rounded-full px-8 shadow-lg shadow-primary/20">Contact</Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {/* Tabs-like flow */}
              <AnimatePresence mode="wait">
                {step === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <section className="space-y-4">
                      <h2 className="text-xl font-bold">About</h2>
                      <p className="text-muted leading-relaxed">
                        {business.description || "A professional service provider dedicated to excellence."}
                      </p>
                    </section>

                    <section className="space-y-4">
                      <h2 className="text-xl font-bold">Services</h2>
                      {services.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {services.map((svc) => (
                            <Card 
                              key={svc.id} 
                              className={cn(
                                "hover:border-primary transition-all cursor-pointer group relative overflow-hidden",
                                selectedService?.id === svc.id ? "border-primary bg-primary/5 shadow-sm" : ""
                              )}
                              onClick={() => setSelectedService(svc)}
                            >
                              <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{svc.name}</h3>
                                    <p className="text-sm text-muted">{svc.description}</p>
                                    <div className="flex items-center text-xs text-muted pt-2 space-x-3">
                                      <span className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {svc.duration_minutes} mins
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-primary">{formatCurrency(svc.price)}</div>
                                    <Button 
                                      variant={selectedService?.id === svc.id ? "default" : "outline"} 
                                      size="sm" 
                                      className="mt-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedService(svc);
                                        setStep('datetime');
                                      }}
                                    >
                                      Select
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Card className="border-dashed">
                          <CardContent className="p-12 text-center text-muted">
                            <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No active services available at the moment.</p>
                          </CardContent>
                        </Card>
                      )}
                    </section>
                  </motion.div>
                )}

                {step === 'datetime' && (
                  <motion.div
                    key="datetime"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" onClick={() => setStep('details')} className="space-x-2">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to services</span>
                      </Button>
                      <Badge variant="outline">Step 2 of 3</Badge>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h2 className="text-xl font-bold">Select Date</h2>
                        <input 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          value={selectedDate}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedTime(null);
                          }}
                          className="w-full md:w-auto p-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-xl font-bold">Available Time Slots</h2>
                        {availableTimeSlots.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {availableTimeSlots.map((time) => (
                              <Button
                                key={time}
                                variant={selectedTime === time ? 'default' : 'outline'}
                                className={cn(
                                  "h-12",
                                  selectedTime === time ? "shadow-lg shadow-primary/20" : ""
                                )}
                                onClick={() => setSelectedTime(time)}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-border text-muted">
                            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No available slots for this date. Please try another day.</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-8">
                        <Button 
                          className="w-full h-14 text-lg font-bold rounded-xl"
                          disabled={!selectedTime}
                          onClick={() => setStep('confirm')}
                        >
                          Review Booking
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 'confirm' && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" onClick={() => setStep('datetime')} className="space-x-2">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to time selection</span>
                      </Button>
                      <Badge variant="outline">Step 3 of 3</Badge>
                    </div>

                    <Card className="overflow-hidden border-primary/20 shadow-xl shadow-primary/5">
                      <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <CardTitle>Booking Summary</CardTitle>
                        <CardDescription>Review your appointment details before confirming.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <div className="space-y-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-muted">Service</span>
                              <p className="text-xl font-bold">{selectedService?.name}</p>
                              <p className="text-sm text-muted">{selectedService?.duration_minutes} minutes</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-muted">Date & Time</span>
                              <div className="flex items-center text-lg font-medium">
                                <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
                                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                              </div>
                              <div className="flex items-center text-lg font-medium">
                                <Clock className="w-5 h-5 mr-2 text-primary" />
                                {selectedTime}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-6">
                            <div className="space-y-1 text-md-right">
                              <span className="text-xs font-bold uppercase tracking-wider text-muted">Business</span>
                              <p className="text-xl font-bold">{business.business_name}</p>
                              <p className="text-sm text-muted">{business.city}, {business.state}</p>
                            </div>
                            <div className="pt-4 border-t border-border space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-muted">Subtotal</span>
                                <span className="font-medium">{formatCurrency(selectedService?.price || 0)}</span>
                              </div>
                              <div className="flex justify-between items-center text-xl font-bold">
                                <span>Total</span>
                                <span className="text-primary">{formatCurrency(selectedService?.price || 0)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg flex items-start space-x-3 text-blue-800 text-sm">
                          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <p>You can cancel or reschedule this booking up to 24 hours before the appointment.</p>
                        </div>

                        <Button 
                          className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl shadow-primary/20"
                          disabled={isSubmitting}
                          onClick={handleCreateBooking}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-6 h-6 animate-spin mr-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-6 h-6 mr-2" />
                              Confirm Booking
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Location & Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3 text-sm">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">{business.address || "Address not provided"}</p>
                      <p className="text-muted">{business.city}, {business.state}</p>
                    </div>
                  </div>
                  {business.phone && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{business.phone}</span>
                    </div>
                  )}
                  <Button variant="outline" className="w-full">Get Directions</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => {
                    const h = hours.find(hour => hour.day_of_week === idx);
                    return (
                      <div key={day} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                        <span className={cn(new Date().getDay() === idx ? "font-bold text-primary" : "text-muted")}>{day}</span>
                        <span className="font-medium">
                          {h ? (h.is_closed ? "Closed" : `${h.opening_time} - ${h.closing_time}`) : "09:00 - 17:00"}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
