'use client';

import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Calendar, Users, DollarSign, ArrowUpRight, Clock, Star, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BusinessDashboard() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Business Dashboard</h1>
            <p className="text-muted">Manage your services, bookings, and revenue.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="success" className="h-8 px-4 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Verified Business
            </Badge>
            <Button>
              <Clock className="mr-2 w-4 h-4" />
              Set Hours
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">₦1,250,000</p>
                <p className="text-xs text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +12% this month
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted">Active Bookings</p>
                <p className="text-2xl font-bold text-foreground">42</p>
                <p className="text-xs text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +5 since yesterday
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted">Total Customers</p>
                <p className="text-2xl font-bold text-foreground">156</p>
                <p className="text-xs text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +8 new this week
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted">Avg. Rating</p>
                <p className="text-2xl font-bold text-foreground">4.9</p>
                <p className="text-xs text-muted flex items-center">
                  From 84 reviews
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-gray-50 text-xs font-bold uppercase tracking-wider text-muted">
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold text-xs">
                              JD
                            </div>
                            <span className="font-medium text-sm">John Doe {i}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">Premium Haircut</td>
                        <td className="px-6 py-4 text-sm text-muted">Oct 10, 2:00 PM</td>
                        <td className="px-6 py-4 text-sm font-bold">₦15,000</td>
                        <td className="px-6 py-4">
                          <Badge variant={i % 2 === 0 ? 'success' : 'secondary'} className="text-[10px]">
                            {i % 2 === 0 ? 'Confirmed' : 'Pending'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Business Tools */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Business Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Booking Capacity</span>
                    <span className="font-bold text-foreground">85%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '85%' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Customer Satisfaction</span>
                    <span className="font-bold text-foreground">98%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '98%' }} />
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <Button className="w-full space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Detailed Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-foreground text-white">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg">Need Help?</h3>
                <p className="text-gray-400 text-sm">
                  Our support team is available 24/7 to help you manage your business better.
                </p>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
