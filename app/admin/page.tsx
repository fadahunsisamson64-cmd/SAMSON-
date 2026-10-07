'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Users, Briefcase, Calendar, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    users: 0,
    businesses: 0,
    bookings: 0
  });
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, businessesRes, bookingsRes, paymentsRes, pendingRes] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('businesses').select('id', { count: 'exact', head: true }),
          supabase.from('bookings').select('id', { count: 'exact', head: true }),
          supabase.from('payments').select('amount').eq('status', 'completed'),
          supabase.from('businesses').select('*').eq('verification_status', 'pending').limit(5)
        ]);

        const totalRevenue = (paymentsRes.data || []).reduce((acc, curr) => acc + curr.amount, 0);

        setStats({
          revenue: totalRevenue,
          users: usersRes.count || 0,
          businesses: businessesRes.count || 0,
          bookings: bookingsRes.count || 0
        });

        setPendingVerifications(pendingRes.data || []);
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
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

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Super Admin Panel</h1>
            <p className="text-muted">Monitor platform activity and verify businesses.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              Platform Settings
            </Button>
            <Button className="bg-primary-deep text-white border-none">
              System Logs
            </Button>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-primary text-white border-none shadow-lg">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-primary-soft text-xs font-bold uppercase tracking-wider">Total Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.revenue)}</p>
                <div className="flex items-center text-primary-soft text-xs mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Live Platform Data
                </div>
              </div>
              <TrendingUp className="w-10 h-10 opacity-20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-muted text-xs font-bold uppercase tracking-wider">Total Users</p>
                <p className="text-3xl font-bold text-foreground">{stats.users}</p>
                <p className="text-emerald-600 text-xs mt-1">Platform wide</p>
              </div>
              <Users className="w-10 h-10 text-primary opacity-20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-muted text-xs font-bold uppercase tracking-wider">Registered Businesses</p>
                <p className="text-3xl font-bold text-foreground">{stats.businesses}</p>
                <p className="text-muted text-xs mt-1">Across all categories</p>
              </div>
              <Briefcase className="w-10 h-10 text-primary opacity-20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-muted text-xs font-bold uppercase tracking-wider">Total Bookings</p>
                <p className="text-3xl font-bold text-foreground">{stats.bookings}</p>
                <p className="text-muted text-xs mt-1">System total</p>
              </div>
              <Calendar className="w-10 h-10 text-primary opacity-20" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Verifications */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-primary" />
                Pending Business Verifications
              </CardTitle>
              {pendingVerifications.length > 0 && <Badge variant="destructive">Action Required</Badge>}
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {pendingVerifications.length > 0 ? (
                  pendingVerifications.map((biz) => (
                    <div key={biz.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-primary font-bold text-xl uppercase">
                          {biz.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{biz.name}</h3>
                          <p className="text-sm text-muted">{biz.city}, {biz.state}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button variant="outline" size="sm">Review</Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none">Approve</Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Reject</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center space-y-4">
                    <ShieldCheck className="w-12 h-12 text-muted mx-auto opacity-20" />
                    <p className="text-muted">No pending business verifications.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Platform Health */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium">Database</span>
                  </div>
                  <Badge variant="success">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium">Authentication</span>
                  </div>
                  <Badge variant="success">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium">Payment Engine</span>
                  </div>
                  <Badge variant="success">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium">Service Network</span>
                  </div>
                  <Badge variant="success">Online</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-2 text-blue-600">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold">System Notice</h3>
                </div>
                <p className="text-sm text-muted">
                  The platform is currently operating normally. No critical issues detected in the last 24 hours.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none">
                  View System Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
