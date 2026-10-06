import React from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Calendar, ShieldCheck, CreditCard, Star, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/components/layouts/AppLayout';

export default function LandingPage() {
  const categories = [
    { name: 'Barbers', icon: '✂️' },
    { name: 'Salons', icon: '💄' },
    { name: 'Consultants', icon: '📊' },
    { name: 'Photographers', icon: '📸' },
    { name: 'Clinics', icon: '🏥' },
    { name: 'Therapists', icon: '💆' },
  ];

  const steps = [
    {
      title: 'Discover',
      description: 'Explore verified businesses and services in your area.',
      icon: Search,
    },
    {
      title: 'Choose',
      description: 'Select the perfect service, provider, and time slot.',
      icon: Star,
    },
    {
      title: 'Book',
      description: 'Secure your appointment with instant confirmation.',
      icon: Calendar,
    },
    {
      title: 'Confirm',
      description: 'Receive notifications and manage your booking easily.',
      icon: CheckCircle2,
    },
  ];

  const features = [
    {
      title: 'Easy Booking',
      description: 'Book services in seconds with our intuitive interface.',
      icon: Clock,
    },
    {
      title: 'Trusted Businesses',
      description: 'Every business on Lumina is manually verified for quality.',
      icon: ShieldCheck,
    },
    {
      title: 'Secure Payments',
      description: 'Your transactions are protected with industry-leading security.',
      icon: CreditCard,
    },
    {
      title: 'Business Tools',
      description: 'Manage your entire business workflow in one place.',
      icon: Zap,
    },
  ];

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 md:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-primary-soft text-primary px-4 py-2 rounded-full text-sm font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Premium Verified Booking Platform</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              Lumina makes booking <span className="text-primary">trusted</span> services simple.
            </h1>
            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto lg:mx-0">
              Discover and book verified service providers with ease. From salons to consultants, manage all your appointments in one secure place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/customer/explore">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8">
                  Explore Businesses
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/auth/sign-up?role=business">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8">
                  List your Business
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center lg:justify-start space-x-8 pt-4">
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted">Verified Businesses</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-foreground">10k+</p>
                <p className="text-sm text-muted">Happy Customers</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-foreground">4.9/5</p>
                <p className="text-sm text-muted">Avg. Rating</p>
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative z-10 rounded-2xl overflow-hidden border border-border shadow-2xl bg-white">
              <img
                src="https://picsum.photos/seed/lumina-hero/800/600"
                alt="Lumina Dashboard Preview"
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-deep/20 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-3xl blur-3xl -z-10" />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white px-4 md:px-8 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">How Lumina Works</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              A simple four-step process to get your services booked and managed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center space-y-4 p-6 rounded-2xl hover:bg-primary-soft/50 transition-colors">
                <div className="w-16 h-16 bg-primary-soft rounded-2xl flex items-center justify-center text-primary mx-auto">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                <p className="text-muted">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-12 -right-4 text-border w-8 h-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Explore Categories</h2>
              <p className="text-muted">Find the best professionals in every field.</p>
            </div>
            <Link href="/customer/explore" className="text-primary font-semibold flex items-center hover:underline">
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, index) => (
              <Card key={index} className="hover:border-primary transition-all cursor-pointer group">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</div>
                  <h3 className="font-bold text-foreground">{cat.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Lumina */}
      <section className="py-24 bg-foreground text-white px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold leading-tight">Why Choose Lumina for Your Bookings?</h2>
              <p className="text-gray-400 text-lg">
                We've built a platform that prioritizes trust, security, and simplicity for both customers and business owners.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="space-y-3">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-primary">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-primary-deep/20 rounded-3xl blur-3xl absolute inset-0" />
              <Card className="bg-white/5 border-white/10 text-white relative z-10 overflow-hidden">
                <CardContent className="p-12 space-y-6">
                  <div className="flex items-center space-x-1 text-primary">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-2xl font-medium italic">
                    "Lumina has completely transformed how I manage my appointments. The verification process gives my clients peace of mind, and the UI is just beautiful."
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary-soft overflow-hidden">
                      <img src="https://picsum.photos/seed/user1/100/100" alt="Avatar" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Sarah Johnson</p>
                      <p className="text-gray-400 text-sm">Professional Consultant</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Business Owner Section */}
      <section className="py-24 px-4 md:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto bg-primary-soft rounded-3xl p-12 md:p-20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Are you a Business Owner?</h2>
              <p className="text-muted text-lg">
                Join Lumina to streamline your booking process, reach more customers, and manage your business with professional tools.
              </p>
              <ul className="space-y-3">
                {['Automated scheduling', 'Secure payment processing', 'Verification badge', 'Analytics dashboard'].map((item) => (
                  <li key={item} className="flex items-center space-x-2 text-foreground font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/sign-up?role=business">
                <Button size="lg" className="h-14 px-8 mt-4">
                  Get Started as a Pro
                </Button>
              </Link>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://picsum.photos/seed/business-pro/600/400"
                alt="Business Pro"
                className="rounded-2xl shadow-xl border border-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 md:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">Ready to book your first service?</h2>
          <p className="text-muted text-xl">
            Join thousands of users who trust Lumina for their booking needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg">
                Create Account
              </Button>
            </Link>
            <Link href="/customer/explore">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg">
                Browse Businesses
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
