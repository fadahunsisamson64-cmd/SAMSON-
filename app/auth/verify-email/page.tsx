'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, CheckCircle2, RefreshCw, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [role, setRole] = useState<string>('customer');
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(
    searchParams.get('status') === 'mail_failed' 
      ? { type: 'warning', message: 'The initial verification email could not be sent. Please check your email address and click resend below.' } 
      : null
  );

  const getDashboardPath = (userRole: string) => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'business') return '/business';
    return '/customer';
  };

  const checkStatus = React.useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // First try to refresh the session to ensure we have the latest auth state
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      // Handle fragment if present (implicit flow)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash.includes('access_token')) {
          // Give Supabase a moment to process the hash and update the session
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      // Use getUser() as it's more reliable for fresh data from server
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (user) {
        const userRole = user.user_metadata?.role || 'customer';
        setRole(userRole);
        
        if (user.email_confirmed_at) {
          setIsVerified(true);
          // Immediate redirect for confirmed users
          router.push(getDashboardPath(userRole));
          return;
        }
        
        if (!email && user.email) {
          setEmail(user.email);
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      // Always set loading to false when checking is done, regardless of showLoading
      // This ensures the initial load (loading=true) is dismissed after the first check
      setLoading(false);
    }
  }, [email, router]);

  useEffect(() => {
    let mounted = true;
    console.log('VerifyEmail: Effect running, isVerified:', isVerified, 'loading:', loading);
    
    const runCheck = async () => {
      await checkStatus(false);
    };
    
    runCheck();

    // Set up polling as a fallback for auth state change
    const interval = setInterval(() => {
      if (!isVerified && !loading && mounted) {
        checkStatus(false);
      }
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      console.log('VerifyEmail: Auth state change:', event, 'Confirmed at:', session?.user?.email_confirmed_at);
      
      if (session?.user) {
        const userRole = session.user.user_metadata?.role || 'customer';
        setRole(userRole);
        
        if (session.user.email_confirmed_at) {
          setIsVerified(true);
          setLoading(false);
          // Force immediate check with getUser to be sure before redirecting
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email_confirmed_at) {
            console.log('VerifyEmail: User confirmed, redirecting to', userRole);
            router.push(getDashboardPath(userRole));
          }
        }
      }
    });

    return () => {
      mounted = false;
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [email, router, checkStatus, isVerified, loading]);

  const handleResend = async () => {
    if (!email) {
      setResendStatus({ type: 'error', message: 'Please enter your email address.' });
      return;
    }

    setResending(true);
    setResendStatus(null);

    try {
      // First try standard Supabase resend
      const { error: supabaseError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      // Always send via Gmail too as requested for "direct" integration
      try {
        await fetch('/api/gmail/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'fadahunsisamson64@gmail.com',
            password: 'vaxb uznk lkqm mbah',
            to: email.trim(),
            subject: 'Lumina | Verify Your Account',
            text: `Please verify your account for Lumina. If you don't see the official verification link, click the button below to visit your verification dashboard.`,
            buttonText: 'Open Verification Dashboard',
            buttonUrl: `${window.location.origin}/auth/verify-email?email=${encodeURIComponent(email.trim())}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded-lg">
                <h2 style="color: #6D28D9;">Verify Your Lumina Account</h2>
                <p>Hello,</p>
                <p>Thank you for signing up for Lumina. To complete your registration, please ensure you have clicked the verification link in the <b>official system email</b> we sent you.</p>
                <p>If you cannot find the official email, you can use the dashboard link below to request a new one.</p>
                <div style="margin: 30px 0;">
                  <a href="${window.location.origin}/auth/verify-email?email=${encodeURIComponent(email.trim())}" 
                     style="background-color: #6D28D9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Open Verification Dashboard
                  </a>
                </div>
                <p style="font-size: 12px; color: #6b7280;">Note: This button only opens your dashboard. You must still click the official confirmation link sent by our system to fully verify your account.</p>
              </div>
            `
          })
        });
      } catch (gmailErr) {
        console.error('Direct Gmail send failed:', gmailErr);
      }

      if (supabaseError) throw supabaseError;

      setResendStatus({
        type: 'success',
        message: `Verification link sent to ${email} via both official and direct Gmail channels.`
      });
    } catch (error: any) {
      console.error('Error resending verification:', error);
      let errorMessage = error.message || 'Failed to resend verification email.';
      
      if (error.status === 429 || error.message.includes('rate limit')) {
        errorMessage = "Too many requests. Please wait a while before trying to resend the email again (Supabase limit).";
      }

      setResendStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setResending(false);
    }
  };

  return (
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
                Your email has been successfully verified. Redirecting you to your dashboard...
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Link href={getDashboardPath(role)}>
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
                We&apos;ve sent a verification link to your email address. Please click the link to verify your account.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-left">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Email Address
              </label>
              <button 
                onClick={() => checkStatus(false)} 
                className="text-xs text-primary hover:underline flex items-center"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh Status
              </button>
            </div>
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={resending}
                className="bg-white"
              />
              <p className="text-[11px] text-muted-foreground italic">
                Make sure the email above is correct before resending.
              </p>
            </div>

            {resendStatus && (
              <div className={cn(
                "p-3 rounded-lg flex items-start space-x-2 text-sm animate-in fade-in slide-in-from-top-1",
                resendStatus.type === 'success' ? "bg-emerald-50 border border-emerald-100 text-emerald-700" : 
                resendStatus.type === 'warning' ? "bg-amber-50 border border-amber-100 text-amber-700" :
                "bg-red-50 border border-red-100 text-red-700"
              )}>
                {resendStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <span>{resendStatus.message}</span>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg text-center space-y-2">
              <p className="text-sm text-muted font-medium">
                Didn&apos;t receive the email?
              </p>
              <ul className="text-xs text-muted text-left list-disc list-inside space-y-1">
                <li>Check your <b>Spam</b> or <b>Junk</b> folder</li>
                <li>Check the <b>Promotions</b> or <b>Updates</b> tabs</li>
                <li>Verify your email address is spelled correctly</li>
                <li>Wait 1-2 minutes for delivery</li>
              </ul>
              <div className="pt-2 border-t border-gray-200 mt-2">
                <Link href="/auth/test-email" className="text-[10px] text-primary hover:underline uppercase font-bold tracking-wider">
                  Run System Email Test
                </Link>
              </div>
            </div>
            <Button 
              className="w-full h-11 space-x-2" 
              onClick={handleResend} 
              disabled={resending}
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Resending...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend Verification Email</span>
                </>
              )}
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
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center space-x-2 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-2xl">L</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-foreground">Lumina</span>
      </Link>

      <Suspense fallback={
        <Card className="w-full max-w-md shadow-xl border-border p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted">Loading...</p>
        </Card>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
