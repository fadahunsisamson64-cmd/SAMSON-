'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, RefreshCw, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function VerifyEmailPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsVerified(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        setIsVerified(true);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center space-x-2 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-2xl">L</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-foreground">Lumina</span>
      </Link>

      <Card className="w-full max-w-md shadow-xl border-border text-center">
        {loading ? (
          <CardContent className="py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted">Checking verification status...</p>
          </CardContent>
        ) : isVerified ? (
          <>
            <CardHeader className="space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
                <CardDescription>
                  Your email has been successfully verified. You can now access your dashboard.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/customer">
                <Button className="w-full h-11">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-4">
              <div className="w-16 h-16 bg-primary-soft text-primary rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
                <CardDescription>
                  We've sent a verification link to your email address. Please click the link to verify your account.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted">
                  Didn't receive the email? Check your spam folder or click below to resend.
                </p>
              </div>
              <Button className="w-full h-11 space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Resend Verification Email</span>
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t border-border pt-6">
              <Link href="/auth/login" className="text-sm text-primary font-bold hover:underline">
                Back to Login
              </Link>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
