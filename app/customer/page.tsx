'use client';

import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CustomerDashboard() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Welcome back, User</h1>
            <p className="text-muted">Manage your bookings and explore new services.</p>
          </div>
          <Button size="lg">
            <Calendar className="mr-2 w-4 h-4" />
            New Booking
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted">Upcoming Bookings</p>
                  <p className="text-3xl font-bold text-foreground mt-2">2</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted">Completed</p>
                  <p className="text-3xl font-bold text-foreground mt-2">12</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted">Saved Businesses</p>
                  <p className="text-3xl font-bold text-foreground mt-2">8</p>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Bookings Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Next Appointment</h2>
                <Button variant="link" className="text-primary">View All</Button>
              </div>
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-xl bg-primary-soft flex items-center justify-center text-primary font-bold text-2xl">
                        S
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-foreground">Premium Hair Cut & Styling</h3>
                        <p className="text-muted flex items-center text-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          The Grooming Lounge, Ikeja
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="font-bold text-foreground">Oct 12, 2026</p>
                        <p className="text-sm text-muted">10:00 AM - 11:30 AM</p>
                      </div>
                      <Button variant="outline">Manage</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Recommended for you</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="group cursor-pointer hover:border-primary transition-all">
                    <CardContent className="p-4 flex space-x-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={`https://picsum.photos/seed/rec-${i}/200/200`} alt="Service" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Badge variant="success" className="text-[10px] px-1.5 py-0">Verified</Badge>
                        </div>
                        <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">Luxury Spa Treatment</h3>
                        <div className="flex items-center text-xs text-muted">
                          <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                          <span>4.8 (120 reviews)</span>
                        </div>
                        <p className="text-sm font-bold text-primary mt-1">₦15,000</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                        <img src={`https://picsum.photos/seed/fav-${i}/100/100`} alt="Fav" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Elite Consulting</p>
                        <p className="text-xs text-muted">Professional Services</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">View All Saved</Button>
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
