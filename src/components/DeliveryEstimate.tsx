'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Truck, Clock, MapPin, Shield } from 'lucide-react';

interface DeliveryEstimateProps {
  province?: string;
  city?: string;
  shippingMethod?: 'standard' | 'express';
  standardDays?: string;
  expressDays?: string;
}

const provinceDeliveryDays: Record<string, { standard: string; express: string }> = {
  'Punjab': { standard: '2-3 business days', express: '1-2 business days' },
  'Sindh': { standard: '3-4 business days', express: '2-3 business days' },
  'Khyber Pakhtunkhwa (KPK)': { standard: '3-4 business days', express: '2-3 business days' },
  'Balochistan': { standard: '4-5 business days', express: '3-4 business days' },
  'Islamabad Capital Territory (ICT)': { standard: '2-3 business days', express: '1-2 business days' },
  'Azad Jammu & Kashmir (AJK)': { standard: '4-5 business days', express: '3-4 business days' },
  'Gilgit Baltistan (GB)': { standard: '5-7 business days', express: '4-5 business days' },
};

export function DeliveryEstimate({ 
  province, 
  city, 
  shippingMethod = 'standard',
  standardDays = '3-5 business days',
  expressDays = '1-2 business days'
}: DeliveryEstimateProps) {
  const deliveryInfo = province ? provinceDeliveryDays[province] : null;
  const estimatedDays = shippingMethod === 'express' 
    ? (deliveryInfo?.express || expressDays)
    : (deliveryInfo?.standard || standardDays);

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
      <CardContent className="p-6">
        <h3 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Delivery Information
        </h3>
        
        <div className="space-y-4">
          {/* Estimated Delivery Time */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-emerald-800">Estimated Delivery</p>
              <p className="text-sm text-emerald-700">{estimatedDays}</p>
              {province && city && (
                <p className="text-xs text-emerald-600 mt-1">
                  to {city}, {province}
                </p>
              )}
            </div>
          </div>

          {/* Shipping Method */}
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-emerald-800">Shipping Method</p>
              <p className="text-sm text-emerald-700 capitalize">{shippingMethod} Delivery</p>
            </div>
          </div>

          {/* Shipping Partner */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-emerald-800">Shipping Partner</p>
              <p className="text-sm text-emerald-700">TCS Courier / Leopard Courier</p>
            </div>
          </div>

          {/* Secure Packaging */}
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-emerald-800">Secure Packaging</p>
              <p className="text-sm text-emerald-700">
                All items are carefully packaged to ensure safe delivery
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-emerald-200">
          <p className="text-xs text-emerald-600">
            * Delivery times may vary based on location and order volume. You will receive tracking information once your order is shipped.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
