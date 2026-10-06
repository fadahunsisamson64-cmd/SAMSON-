'use client';

import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Users, Briefcase, Calendar, TrendingUp, AlertTriangle, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AdminDashboard() {
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
            <Button className="bg-primary-deep text-white">
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
                <p className="text-3xl font-bold">₦12.5M</p>
                <div className="flex items-center text-primary-soft text-xs mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +18% from last month
                </div>
              </div>
              <TrendingUp className="w-10 h-10 opacity-20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-muted text-xs font-bold uppercase tracking-wider">Active Users</p>
                <p className="text-3xl font-bold text-foreground">12,450</p>
                <p className="text-emerald-600 text-xs mt-1">+240 this week</p>
              </div>
              <Users className="w-10 h-10 text-primary opacity-20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-muted text-xs font-bold uppercase tracking-wider">Total Businesses</p>
                <p className="text-3xl font-bold text-foreground">842</p>
                <p className="text-muted text-xs mt-1">12 pending verification</p>
              </div>
              <Briefcase className="w-10 h-10 text-primary opacity-20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-muted text-xs font-bold uppercase tracking-wider">Total Bookings</p>
                <p className="text-3xl font-bold text-foreground">48,210</p>
                <p className="text-muted text-xs mt-1">Across all categories</p>
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
              <Badge variant="destructive">Action Required</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden">
                        <img src={`https://picsum.photos/seed/admin-biz-${i}/100/100`} alt="Biz" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Professional Service Group {i}</h3>
                        <p className="text-sm text-muted">Registered on Oct {10 + i}, 2026</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button variant="outline" size="sm">Review Docs</Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none">Approve</Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Reject</Button>
                    </div>
                  </div>
                ))}
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
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="text-sm font-medium">Payment Gateway</span>
                  </div>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Slow</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-medium">Email Service</span>
                  </div>
                  <Badge variant="destructive">Down</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold">Urgent Attention</h3>
                </div>
                <p className="text-sm text-muted">
                  3 businesses have reported issues with payment settlements in the last 24 hours.
                </p>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white border-none">
                  Investigate Issues
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
