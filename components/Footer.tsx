import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Lumina</span>
          </Link>
          <p className="text-muted text-sm max-w-xs">
            The premium multi-business booking platform for verified services.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted">Platform</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/customer/explore" className="hover:text-primary transition-colors">Explore Businesses</Link></li>
            <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
            <li><Link href="/business/register" className="hover:text-primary transition-colors">List your Business</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted">Company</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted">Support</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            <li><Link href="/security" className="hover:text-primary transition-colors">Security</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border text-center text-sm text-muted">
        <p>© {new Date().getFullYear()} Lumina. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
