'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function BusinessVerificationPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return;

        const { data } = await supabase
          .from('businesses')
          .select('id, is_verified, verification_status')
          .eq('owner_id', user.id)
          .maybeSingle();

        setBusiness(data);
      } catch (err) {
        console.error('Error fetching verification status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, []);

  const handleSubmitVerification = async () => {
    if (!business?.id) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ 
          verification_status: 'pending',
          updated_at: new Date().toISOString() 
        })
        .eq('id', business.id);

      if (error) throw error;
      
      setBusiness({ ...business, verification_status: 'pending' });
      toast({ 
        title: "Verification Submitted", 
        description: "We have received your verification request." 
      });
    } catch (err: any) {
      console.error('Error submitting verification:', err);
      toast({ 
        title: "Error", 
        description: err.message || "Failed to submit verification.", 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
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

  const isApproved = business?.verification_status === 'approved';
  const isPending = business?.verification_status === 'pending';

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Business Verification</h1>
          <p className="text-muted">Verify your business to build trust with customers.</p>
        </div>

        <Card className={cn(isApproved ? "border-emerald-200 bg-emerald-50/30" : "")}>
          <CardContent className="p-8 text-center space-y-6">
            {isApproved ? (
              <>
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-emerald-900">Your Business is Verified!</h2>
                  <p className="text-emerald-700 max-w-md mx-auto">
                    A verification badge is now displayed on your business profile, helping you attract more customers.
                  </p>
                </div>
              </>
            ) : isPending ? (
              <>
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                  <Loader2 className="w-10 h-10 animate-spin" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-blue-900">Verification in Progress</h2>
                  <p className="text-blue-700 max-w-md mx-auto">
                    Our team is currently reviewing your business information. This usually takes 1-2 business days.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Not Verified Yet</h2>
                  <p className="text-muted max-w-md mx-auto">
                    Submit your business for verification to get the Lumina trust badge.
                  </p>
                </div>
                <Button 
                  className="rounded-full px-12" 
                  onClick={handleSubmitVerification}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Submit for Verification
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Why get verified?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">Appear higher in search results</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">Build immediate trust with new customers</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">Get access to exclusive platform features</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted">To get verified, you need:</p>
              <ul className="text-sm space-y-2 list-disc list-inside">
                <li>Complete business profile</li>
                <li>Valid contact information</li>
                <li>At least one active service</li>
                <li>Working hours configured</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
