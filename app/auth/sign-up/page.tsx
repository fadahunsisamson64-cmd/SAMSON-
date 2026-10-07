'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, Briefcase, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function SignUpPage() {
  const [role, setRole] = useState<'customer' | 'business'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: role,
          },
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      if (signUpError) {
        // If the error is specifically about sending the email, the user account might still have been created.
        // We redirect them to the verification page so they can try the "Resend" button which has better delivery logic.
        if (signUpError.message.toLowerCase().includes('email') || signUpError.message.toLowerCase().includes('confirmation')) {
          console.warn('Signup succeeded but email failed. Triggering direct Gmail fallback.');
          
          // Trigger direct Gmail send
          try {
            await fetch('/api/gmail/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: 'fadahunsisamson64@gmail.com',
                password: 'vaxb uznk lkqm mbah',
                to: formData.email,
                subject: 'Lumina | Verify Your Account',
                text: `Hello ${formData.name},\n\nWelcome to Lumina! Please verify your account by visiting your verification dashboard below.`,
                buttonText: 'Verify Account',
                buttonUrl: `${window.location.origin}/auth/verify-email?email=${encodeURIComponent(formData.email)}`,
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="color: #6D28D9;">Verify Your Lumina Account</h2>
                    <p>Hello ${formData.name},</p>
                    <p>Welcome to Lumina! To complete your registration, please ensure you have clicked the verification link in the <b>official system email</b> we sent you.</p>
                    <p>If you cannot find the official email, you can use the dashboard link below to request a new one.</p>
                    <div style="margin: 30px 0;">
                      <a href="${window.location.origin}/auth/verify-email?email=${encodeURIComponent(formData.email)}" 
                         style="background-color: #6D28D9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Open Verification Dashboard
                      </a>
                    </div>
                    <p style="font-size: 12px; color: #6b7280;">Note: This button only opens your dashboard. You must still click the official confirmation link sent by our system to fully verify your account.</p>
                  </div>
                `
              })
            });
          } catch (e) {
            console.error('Fallback email failed', e);
          }

          router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}&status=mail_failed`);
          return;
        }
        throw signUpError;
      }

      if (data.user) {
        // Direct Gmail SMTP send for reliability
        try {
          await fetch('/api/gmail/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'fadahunsisamson64@gmail.com',
              password: 'vaxb uznk lkqm mbah',
              to: formData.email,
              subject: 'Lumina | Welcome & Verification',
              text: `Hello ${formData.name},\n\nYour account has been created on Lumina! Please visit your verification dashboard to complete the setup.`,
              buttonText: 'Complete Verification',
              buttonUrl: `${window.location.origin}/auth/verify-email?email=${encodeURIComponent(formData.email)}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                  <h2 style="color: #6D28D9;">Welcome to Lumina</h2>
                  <p>Hello ${formData.name},</p>
                  <p>Your account has been created successfully! To complete your setup, please ensure you have clicked the verification link in the <b>official system email</b> we sent you.</p>
                  <p>If you cannot find the official email, you can use the dashboard link below to request a new one.</p>
                  <div style="margin: 30px 0;">
                    <a href="${window.location.origin}/auth/verify-email?email=${encodeURIComponent(formData.email)}" 
                       style="background-color: #6D28D9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      Complete Verification
                    </a>
                  </div>
                  <p style="font-size: 12px; color: #6b7280;">Note: This button only opens your dashboard. You must still click the official confirmation link sent by our system to fully verify your account.</p>
                </div>
              `
            })
          });
        } catch (e) {
          console.error('Direct Gmail send failed', e);
        }

        // Success - redirect to verify email page
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'An unexpected error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12">
      <Link href="/" className="flex items-center space-x-2 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-2xl">L</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-foreground">Lumina</span>
      </Link>

      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Join Lumina to start booking or managing services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setRole('customer')}
              disabled={loading}
              className={cn(
                "flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all",
                role === 'customer' ? "bg-white text-primary shadow-sm" : "text-muted hover:text-foreground",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <User className="w-4 h-4" />
              <span>Customer</span>
            </button>
            <button
              onClick={() => setRole('business')}
              disabled={loading}
              className={cn(
                "flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all",
                role === 'business' ? "bg-white text-primary shadow-sm" : "text-muted hover:text-foreground",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <Briefcase className="w-4 h-4" />
              <span>Business</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-start space-x-2 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </div>

            {role === 'business' && (
              <div className="p-4 bg-primary-soft rounded-lg space-y-2">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Business Verification</p>
                <p className="text-xs text-muted leading-relaxed">
                  Business accounts require manual verification by our admin team before you can list services.
                </p>
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  {role === 'customer' ? 'Create Account' : 'Register Business'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted font-medium">Or join with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full h-11 space-x-2" disabled={loading}>
            <ShieldCheck className="w-4 h-4" />
            <span>Sign up with Passkey</span>
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-border pt-6">
          <p className="text-sm text-center text-muted">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary font-bold hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
