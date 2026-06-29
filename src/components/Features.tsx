'use client';

import { Truck, Shield, RotateCcw, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Quick delivery across all major cities in Pakistan',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Safe and secure payment options including COD',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: 'Hassle-free return policy within 7 days',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: '100% genuine fashion products with quality guarantee',
  },
];

export default function Features() {
  return (
    <section className="py-16 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border border-emerald-100 bg-white hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100 transition-all">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
                  <feature.icon className="h-6 w-6 text-emerald-700" />
                </div>
                <h3 className="font-semibold mb-2 text-emerald-800">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
