'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EmailTestPage() {
  const [email, setEmail] = useState('emmanuelwritecode@gmail.com');
  const [gmailUser, setGmailUser] = useState('fadahunsisamson@gmail.com');
  const [gmailPass, setGmailPass] = useState('vaxbuznklkqmmbah');
  const [testMode, setTestMode] = useState<'supabase' | 'gmail' | 'search'>('supabase');
  const [searchQuery, setSearchQuery] = useState('Lumina');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string, details?: any } | null>(null);

  const runEmailTest = async () => {
    setLoading(true);
    setStatus(null);
    setMessages([]);

    try {
      if (testMode === 'supabase') {
        const { data, error } = await supabase.auth.resend({
          type: 'signup',
          email: email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/verify-email`,
          },
        });

        if (error) {
          if (error.message.includes('not found') || error.status === 422) {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/auth/verify-email`,
            });
            if (resetError) throw resetError;
            setStatus({ type: 'success', message: `Ping test successful! Reset link sent to ${email}.`, details: { method: 'resetPasswordForEmail' } });
          } else {
            throw error;
          }
        } else {
          setStatus({ type: 'success', message: `Resend successful! Verification link sent to ${email}.`, details: data });
        }
      } else if (testMode === 'gmail') {
        const response = await fetch('/api/gmail/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: gmailUser,
            password: gmailPass,
            to: email,
            subject: 'Lumina SMTP Test',
            text: 'If you receive this, your Gmail SMTP credentials are correct and Lumina can send emails directly.'
          }),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        setStatus({ type: 'success', message: 'Direct Gmail SMTP test successful! Email sent.', details: data });
      } else if (testMode === 'search') {
        const response = await fetch('/api/gmail/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: gmailUser,
            password: gmailPass,
            query: searchQuery
          }),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        setMessages(data.messages || []);
        setStatus({ type: 'success', message: `Found ${data.messages?.length || 0} messages matching "${searchQuery}".` });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Test failed.', details: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4">
      <Link href="/auth/verify-email" className="flex items-center text-sm text-muted mb-8 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Verification
      </Link>

      <Card className="w-full max-w-2xl shadow-xl border-border">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
            <Mail className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Email System Diagnostic</CardTitle>
          <CardDescription>
            Troubleshoot email delivery issues and verify credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex p-1 bg-muted rounded-lg">
            <button 
              onClick={() => setTestMode('supabase')}
              className={cn("flex-1 py-2 text-sm font-medium rounded-md transition-all", testMode === 'supabase' ? "bg-background shadow-sm" : "hover:bg-background/50 text-muted-foreground")}
            >
              Supabase Auth
            </button>
            <button 
              onClick={() => setTestMode('gmail')}
              className={cn("flex-1 py-2 text-sm font-medium rounded-md transition-all", testMode === 'gmail' ? "bg-background shadow-sm" : "hover:bg-background/50 text-muted-foreground")}
            >
              Direct SMTP
            </button>
            <button 
              onClick={() => setTestMode('search')}
              className={cn("flex-1 py-2 text-sm font-medium rounded-md transition-all", testMode === 'search' ? "bg-background shadow-sm" : "hover:bg-background/50 text-muted-foreground")}
            >
              Inbox Search
            </button>
          </div>

          <div className="space-y-4">
            {testMode !== 'supabase' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gmail Address</label>
                  <Input value={gmailUser} onChange={(e) => setGmailUser(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">App Password</label>
                  <Input type="password" value={gmailPass} onChange={(e) => setGmailPass(e.target.value)} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {testMode === 'search' ? 'Search Keywords' : 'Test Recipient Email'}
              </label>
              <Input 
                value={testMode === 'search' ? searchQuery : email} 
                onChange={(e) => testMode === 'search' ? setSearchQuery(e.target.value) : setEmail(e.target.value)}
                placeholder={testMode === 'search' ? "e.g. Lumina, verify" : "e.g. user@gmail.com"}
                disabled={loading}
              />
            </div>
          </div>

          {status && (
            <div className={cn(
              "p-4 rounded-lg flex flex-col space-y-2 text-sm border",
              status.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
            )}>
              <div className="flex items-start space-x-2">
                {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <span className="font-medium">{status.message}</span>
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent matching emails</h4>
              <div className="divide-y border rounded-lg bg-white overflow-hidden">
                {messages.map((msg, i) => (
                  <div key={i} className="p-3 text-sm hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold truncate pr-4">{msg.subject || '(No Subject)'}</span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(msg.date).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>From: {msg.from}</span>
                      <span className="flex space-x-1">
                        {msg.flags?.map((f: string) => (
                          <span key={f} className="px-1 bg-gray-100 rounded text-[9px]">{f}</span>
                        ))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button className="w-full h-11" onClick={runEmailTest} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              testMode === 'search' ? 'Search Inbox' : testMode === 'gmail' ? 'Send via Gmail SMTP' : 'Test Supabase SMTP'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
