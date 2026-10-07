'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

export default function BusinessServicesPage() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
            .from('services')
            .select('*')
            .eq('business_id', business.id)
            .order('created_at', { ascending: false });
          
          setServices(data || []);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleActive = async (service: any) => {
    try {
      const newStatus = !service.is_active;
      const { error } = await supabase
        .from('services')
        .update({ is_active: newStatus, updated_at: new Date().toISOString() })
        .eq('id', service.id);
      
      if (error) throw error;
      
      setServices(services.map(s => s.id === service.id ? { ...s, is_active: newStatus } : s));
      toast({ 
        title: newStatus ? "Service Activated" : "Service Deactivated", 
        description: `${service.name} is now ${newStatus ? 'active' : 'inactive'}.` 
      });
    } catch (err) {
      console.error('Error toggling service status:', err);
      toast({ title: "Error", description: "Failed to update service status.", variant: "destructive" });
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    try {
      const serviceData = {
        ...editingService,
        business_id: businessId,
        updated_at: new Date().toISOString()
      };

      if (editingService.id) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);
        if (error) throw error;
        setServices(services.map(s => s.id === editingService.id ? serviceData : s));
      } else {
        const { data, error } = await supabase
          .from('services')
          .insert(serviceData)
          .select()
          .single();
        if (error) throw error;
        setServices([data, ...services]);
      }

      setIsDialogOpen(false);
      setEditingService(null);
      toast({ title: "Success", description: "Service saved successfully." });
    } catch (err: any) {
      console.error('Error saving service:', err);
      toast({ title: "Error", description: "Failed to save service.", variant: "destructive" });
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      setServices(services.filter(s => s.id !== id));
      toast({ title: "Deleted", description: "Service has been removed." });
    } catch (err) {
      console.error('Error deleting service:', err);
      toast({ title: "Error", description: "Failed to delete service.", variant: "destructive" });
    }
  };

  const openNewServiceDialog = () => {
    setEditingService({
      name: '',
      description: '',
      price: 0,
      duration_minutes: 30,
      is_active: true
    });
    setIsDialogOpen(true);
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
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Services Management</h1>
            <p className="text-muted">Create and manage the services you offer to customers.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewServiceDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingService?.id ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveService} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Name</label>
                  <Input 
                    required 
                    value={editingService?.name || ''} 
                    onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea 
                    value={editingService?.description || ''} 
                    onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price ($)</label>
                    <Input 
                      type="number" 
                      required 
                      value={editingService?.price || 0} 
                      onChange={(e) => setEditingService({...editingService, price: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration (minutes)</label>
                    <Input 
                      type="number" 
                      required 
                      value={editingService?.duration_minutes || 30} 
                      onChange={(e) => setEditingService({...editingService, duration_minutes: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Service</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.length > 0 ? (
            services.map((svc) => (
              <Card key={svc.id} className={cn("hover:shadow-md transition-all", !svc.is_active && "opacity-60")}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg">{svc.name}</h3>
                      <p className="text-sm text-muted line-clamp-2">{svc.description}</p>
                    </div>
                    <Badge 
                      variant={svc.is_active ? 'success' : 'outline'}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleToggleActive(svc)}
                    >
                      {svc.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="text-lg font-bold text-primary">{formatCurrency(svc.price)}</div>
                    <div className="text-sm text-muted">{svc.duration_minutes} mins</div>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-grow"
                      onClick={() => {
                        setEditingService(svc);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteService(svc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl text-muted space-y-4">
              <Plus className="w-12 h-12 mx-auto opacity-20" />
                <p>You haven&apos;t added any services yet.</p>
              <Button variant="outline" onClick={openNewServiceDialog}>Add your first service</Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
