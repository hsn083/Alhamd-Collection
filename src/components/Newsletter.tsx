'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Sparkles } from 'lucide-react';

export default function Newsletter() {
  return (
    <section className="py-16 bg-gradient-to-r from-emerald-700 to-teal-700 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-4">
            <Mail className="h-7 w-7 text-yellow-300" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Stay Ahead of Fashion</h2>
          <p className="mb-8 text-emerald-100">
            Subscribe for exclusive deals, new arrivals, and style inspiration delivered straight to your inbox.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-300"
            />
            <Button className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-semibold px-6 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Subscribe
            </Button>
          </div>
          
          <p className="text-sm text-emerald-200 mt-4">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
