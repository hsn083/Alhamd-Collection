'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Truck, 
  Clock, 
  MapPin, 
  Shield,
  CheckCircle,
  Package
} from 'lucide-react';

export default function ShippingPage() {
  const shippingMethods = [
    {
      icon: Truck,
      title: 'Standard Delivery',
      description: '3-5 business days',
      price: 'PKR 250',
      details: 'Available nationwide',
    },
    {
      icon: Clock,
      title: 'Express Delivery',
      description: '1-2 business days',
      price: 'PKR 500',
      details: 'Major cities only',
    },
  ];

  const coverageAreas = [
    'Lahore',
    'Karachi',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Sialkot',
    'Gujranwala',
    'Sargodha',
    'Hyderabad',
  ];

  const courierPartners = [
    'TCS',
    'Leopards Courier',
    'M&P Express',
    'Pakistan Post',
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Shipping Information</h1>
            <p className="text-xl text-white/90">Fast and reliable delivery across Pakistan</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Shipping Methods */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Shipping Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shippingMethods.map((method, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <method.icon className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>{method.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{method.details}</span>
                      <span className="font-bold text-primary">{method.price}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Delivery Coverage */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Delivery Coverage</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <MapPin className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Nationwide Delivery</h3>
                    <p className="text-muted-foreground">
                      We deliver to all major cities and rural areas across Pakistan. Our delivery network covers:
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {coverageAreas.map((city, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{city}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Courier Partners */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Courier Partners</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  We partner with Pakistan's leading courier services to ensure your orders reach you safely and on time.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {courierPartners.map((partner, index) => (
                    <div key={index} className="border rounded-lg p-4 text-center">
                      <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium">{partner}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Policy */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Shipping Policy</h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Order Processing</h3>
                    <p className="text-muted-foreground">
                      Orders are processed within 24-48 hours on business days. You will receive a confirmation email with tracking information once your order is shipped.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Delivery Time</h3>
                    <p className="text-muted-foreground">
                      Standard delivery takes 3-5 business days, while express delivery takes 1-2 business days for major cities. Delivery times may vary during holidays and special events.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Truck className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Cash on Delivery</h3>
                    <p className="text-muted-foreground">
                      We offer Cash on Delivery (COD) for orders up to PKR 50,000. For orders above this amount, advance payment is required via EasyPaisa, JazzCash, or bank transfer.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Address Changes</h3>
                    <p className="text-muted-foreground">
                      Address changes can be requested within 24 hours of placing the order. After that, we cannot guarantee changes as the order may already be in transit.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tracking */}
          <div className="bg-muted rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Track Your Order</h2>
            <p className="text-muted-foreground mb-6">
              Enter your tracking number to check the status of your order
            </p>
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Enter tracking number (e.g., TCS123456789)"
                className="flex-1 px-4 py-2 border rounded-md"
              />
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Track Order
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
