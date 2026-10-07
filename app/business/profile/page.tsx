'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Loader2, Save, Store, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BusinessProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return;

        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setBusiness(data);
        } else {
          // Initialize empty for creation
          setBusiness({
            business_name: '',
            business_type: 'Other',
            description: '',
            email: user.email,
            phone: '',
            website: '',
            address: '',
            city: '',
            state: '',
            country: 'USA'
          });
        }
      } catch (err) {
        console.error('Error fetching business:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;

      const businessData = {
        ...business,
        owner_id: user.id,
        updated_at: new Date().toISOString()
      };

      let error;
      if (business.id) {
        const { error: updateError } = await supabase
          .from('businesses')
          .update(businessData)
          .eq('id', business.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('businesses')
          .insert(businessData);
        error = insertError;
      }

      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your business information has been saved successfully.",
      });
    } catch (err: any) {
      console.error('Error saving business:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to save profile.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
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

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Business Profile</h1>
            <p className="text-muted">Manage your public business identity.</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="w-5 h-5 mr-2 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name</label>
                  <Input 
                    required
                    value={business.business_name} 
                    onChange={(e) => setBusiness({...business, business_name: e.target.value})}
                    placeholder="e.g. Lumina Barber Shop"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Type</label>
                  <Select 
                    value={business.business_type} 
                    onValueChange={(val) => setBusiness({...business, business_type: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Barber">Barber</SelectItem>
                      <SelectItem value="Salon">Salon</SelectItem>
                      <SelectItem value="Consultant">Consultant</SelectItem>
                      <SelectItem value="Photographer">Photographer</SelectItem>
                      <SelectItem value="Clinic">Clinic</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  value={business.description} 
                  onChange={(e) => setBusiness({...business, description: e.target.value})}
                  placeholder="Tell customers about your services..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Street Address</label>
                <Input 
                  value={business.address} 
                  onChange={(e) => setBusiness({...business, address: e.target.value})}
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input 
                    value={business.city} 
                    onChange={(e) => setBusiness({...business, city: e.target.value})}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Input 
                    value={business.state} 
                    onChange={(e) => setBusiness({...business, state: e.target.value})}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <Input 
                    value={business.country} 
                    onChange={(e) => setBusiness({...business, country: e.target.value})}
                    placeholder="Country"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Mail className="w-4 h-4 mr-2" /> Email
                  </label>
                  <Input 
                    type="email"
                    value={business.email} 
                    onChange={(e) => setBusiness({...business, email: e.target.value})}
                    placeholder="business@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Phone className="w-4 h-4 mr-2" /> Phone
                  </label>
                  <Input 
                    value={business.phone} 
                    onChange={(e) => setBusiness({...business, phone: e.target.value})}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Globe className="w-4 h-4 mr-2" /> Website
                </label>
                <Input 
                  value={business.website} 
                  onChange={(e) => setBusiness({...business, website: e.target.value})}
                  placeholder="https://www.yourbusiness.com"
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
