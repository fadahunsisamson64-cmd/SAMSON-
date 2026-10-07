'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Loader2, MessageSquare, User, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

export default function BusinessReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);

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
            .from('reviews')
            .select(`
              *,
              customer:customer_id (full_name),
              booking:booking_id (service:service_id (name))
            `)
            .eq('business_id', business.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setReviews(data || []);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
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

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Customer Reviews</h1>
            <p className="text-muted">Manage your business reputation and customer feedback.</p>
          </div>
          
          {reviews.length > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4 px-6 flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-xs font-bold text-muted uppercase">Avg Rating</p>
                  <p className="text-2xl font-bold text-primary">{averageRating}</p>
                </div>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={i < Math.round(Number(averageRating)) ? "fill-current" : "opacity-20"} size={16} />
                  ))}
                </div>
                <div className="text-center border-l pl-4">
                  <p className="text-xs font-bold text-muted uppercase">Total</p>
                  <p className="text-2xl font-bold text-foreground">{reviews.length}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {review.customer?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-foreground">{review.customer?.full_name || 'Guest User'}</h3>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={i < review.rating ? "fill-current" : "opacity-20"} size={12} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(review.created_at)}
                        </p>
                        <p className="text-sm font-medium text-primary">
                          Service: {review.booking?.service?.name || 'Unknown Service'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg italic text-foreground relative">
                    <MessageSquare className="absolute -top-2 -left-2 w-5 h-5 text-primary/20" />
                    {review.comment || <span className="text-muted italic">No comment provided.</span>}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed py-20">
              <CardContent className="text-center space-y-4">
                <Star className="w-12 h-12 mx-auto opacity-10" />
                <p className="text-muted">No reviews yet. Customers can review completed bookings.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
