'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2, DollarSign, Calendar, ArrowUpRight, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function BusinessPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    lastMonthEarnings: 0
  });

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
          const { data, error } = await supabase
            .from('payments')
            .select(`
              *,
              booking:booking_id (
                service:service_id (name),
                customer:customer_id (full_name)
              )
            `)
            .eq('business_id', business.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setPayments(data || []);

          // Calculate stats
          const total = (data || [])
            .filter(p => p.status === 'completed')
            .reduce((acc, curr) => acc + curr.amount, 0);
          
          const pending = (data || [])
            .filter(p => p.status === 'pending')
            .reduce((acc, curr) => acc + curr.amount, 0);

          setStats({
            totalEarnings: total,
            pendingPayouts: pending,
            lastMonthEarnings: total * 0.8 // Mocking comparison for UI
          });
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Payments & Earnings</h1>
          <p className="text-muted">Track your revenue and transaction history.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary text-white border-none shadow-lg shadow-primary/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary-soft">Total Earnings</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted">Pending Payments</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.pendingPayouts)}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted">Transactions</p>
                <p className="text-3xl font-bold text-foreground">{payments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {payments.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-gray-50 text-xs font-bold uppercase tracking-wider text-muted">
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono text-muted">
                          {payment.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 font-medium text-sm">
                          {payment.booking?.customer?.full_name || 'Guest'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {payment.booking?.service?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="px-6 py-4 font-bold text-sm">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant={payment.status === 'completed' ? 'success' : 'outline'} 
                            className="capitalize"
                          >
                            {payment.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <CreditCard className="w-12 h-12 mx-auto opacity-10" />
                  <p className="text-muted">No transactions found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
