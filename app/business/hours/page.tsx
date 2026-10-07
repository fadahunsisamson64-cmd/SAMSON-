'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Loader2, Save, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function BusinessHoursPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hours, setHours] = useState<any[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const { toast } = useToast();

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
          const { data } = await supabase
            .from('business_hours')
            .select('*')
            .eq('business_id', business.id)
            .order('day_of_week', { ascending: true });
          
          // Ensure we have 7 days
          const fullHours = DAYS.map((_, idx) => {
            const dayHour = data?.find(h => h.day_of_week === idx);
            return dayHour || {
              business_id: business.id,
              day_of_week: idx,
              opening_time: '09:00',
              closing_time: '17:00',
              is_closed: idx === 0 || idx === 6 // Closed on weekends by default
            };
          });
          setHours(fullHours);
        }
      } catch (err) {
        console.error('Error fetching hours:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveHours = async () => {
    if (!businessId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('business_hours')
        .upsert(hours, { onConflict: 'business_id, day_of_week' });

      if (error) throw error;
      toast({ title: "Hours Updated", description: "Your business hours have been saved." });
    } catch (err: any) {
      console.error('Error saving hours:', err);
      toast({ title: "Error", description: err.message || "Failed to save hours.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateDay = (idx: number, updates: any) => {
    setHours(hours.map((h, i) => i === idx ? { ...h, ...updates } : h));
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

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Business Hours</h1>
            <p className="text-muted">Set when your business is open for appointments.</p>
          </div>
          <Button onClick={handleSaveHours} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        {!businessId && (
          <Card className="bg-yellow-50 border-yellow-100">
            <CardContent className="p-6 flex items-start space-x-3 text-yellow-800">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <p>Please complete your business profile before setting business hours.</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {DAYS.map((day, idx) => {
                const h = hours[idx];
                if (!h) return null;
                return (
                  <div key={day} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center space-x-4 min-w-[140px]">
                      <Switch 
                        checked={!h.is_closed} 
                        onCheckedChange={(val) => updateDay(idx, { is_closed: !val })} 
                      />
                      <span className={cn("font-bold text-lg", h.is_closed ? "text-muted" : "text-foreground")}>
                        {day}
                      </span>
                    </div>

                    {!h.is_closed ? (
                      <div className="flex items-center space-x-4 flex-grow max-w-md">
                        <div className="flex-grow space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted tracking-wider">Opens at</label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                            <Input 
                              type="time" 
                              value={h.opening_time} 
                              onChange={(e) => updateDay(idx, { opening_time: e.target.value })}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="text-muted pt-4">to</div>
                        <div className="flex-grow space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted tracking-wider">Closes at</label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                            <Input 
                              type="time" 
                              value={h.closing_time} 
                              onChange={(e) => updateDay(idx, { closing_time: e.target.value })}
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-grow text-center md:text-left py-2">
                        <Badge variant="outline" className="text-muted">Closed</Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
