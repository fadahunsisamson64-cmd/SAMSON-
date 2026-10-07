'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export default function OTPPage() {
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center space-x-2 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-2xl">L</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-foreground">Lumina</span>
      </Link>

      <Card className="w-full max-w-md shadow-xl border-border text-center">
        <CardHeader className="space-y-4">
          <div className="w-16 h-16 bg-primary-soft text-primary rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Two-Step Verification</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to your phone/email to continue.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                className="w-12 h-14 text-center text-2xl font-bold p-0"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
            ))}
          </div>
          <Button className="w-full h-11">
            Verify Code
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-border pt-6">
          <div className="flex items-center justify-center space-x-1 text-sm text-muted">
            <span>Didn&apos;t receive the code?</span>
            <button className="text-primary font-bold hover:underline flex items-center">
              <RefreshCw className="w-3 h-3 mr-1" />
              Resend
            </button>
          </div>
          <Link href="/auth/login" className="text-sm text-primary font-bold hover:underline">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
