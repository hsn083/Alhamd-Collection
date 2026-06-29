import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ShoppingCart, User, CreditCard, Truck, AlertTriangle, Scale, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Alhamd Collection',
  description: 'Read the terms and conditions for using Alhamd Collection website and services.',
};

export default function TermsConditionsPage() {
  const lastUpdated = 'June 28, 2026';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-emerald-700 to-teal-700 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-xl text-emerald-100">Please read these terms carefully before using our website</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                Last Updated: {lastUpdated}
              </p>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Alhamd Collection. By accessing or using our website and services, you agree to be bound by these 
                Terms & Conditions. Please read them carefully before making any purchases.
              </p>
            </CardContent>
          </Card>

          {/* Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-emerald-600" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                These Terms & Conditions govern your use of the Alhamd Collection website and the purchase of our products. 
                By using our website, you accept these terms in full. If you disagree with these terms or any part of these terms, 
                you must not use our website.
              </p>
            </CardContent>
          </Card>

          {/* Website Usage */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-emerald-600" />
                Website Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                You may use our website for your personal use and to purchase products for personal use. You may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Use the website for any commercial purpose</li>
                <li>Modify, copy, or redistribute any content from the website</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the website to transmit viruses or malicious code</li>
                <li>Interfere with the proper working of the website</li>
              </ul>
            </CardContent>
          </Card>

          {/* Account Responsibility */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6 text-emerald-600" />
                Account Responsibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                If you create an account on our website, you are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Maintaining the confidentiality of your account password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
                <li>Ensuring that the information you provide is accurate and complete</li>
              </ul>
              <p className="text-gray-600">
                You agree not to share your account details with anyone else.
              </p>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-emerald-600" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We strive to ensure that product information on our website is accurate. However:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Product prices are subject to change without notice</li>
                <li>Product images may vary slightly from actual products due to lighting and monitor settings</li>
                <li>Colors may appear different depending on your device screen</li>
                <li>We reserve the right to discontinue any product at any time</li>
                <li>Product descriptions are for general information and do not constitute warranties</li>
              </ul>
            </CardContent>
          </Card>

          {/* Orders */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-emerald-600" />
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                <strong>Order Confirmation:</strong> After placing an order, you will receive an order confirmation via email. 
                This confirmation does not guarantee acceptance of your order.
              </p>
              <p className="text-gray-600">
                <strong>Order Cancellation:</strong> You may request to cancel your order within 24 hours of placing it. 
                After 24 hours, cancellation requests will be evaluated on a case-by-case basis.
              </p>
              <p className="text-gray-600">
                <strong>Order Modifications:</strong> Once an order is confirmed, modifications may not be possible. 
                Please review your order carefully before submitting.
              </p>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-emerald-600" />
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We accept the following payment methods:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li><strong>Cash on Delivery (COD):</strong> Pay when you receive your order</li>
                <li><strong>EasyPaisa:</strong> Send payment screenshot for verification</li>
                <li><strong>JazzCash:</strong> Send payment screenshot for verification</li>
              </ul>
              <p className="text-gray-700">
                <strong>Payment Verification:</strong> For EasyPaisa and JazzCash payments, you must provide a payment screenshot. 
                Your order will be processed only after payment verification is complete.
              </p>
              <p className="text-gray-600">
                <strong>Non-Payment:</strong> If payment is not received or verified within 3 business days, your order may be cancelled.
              </p>
            </CardContent>
          </Card>

          {/* Shipping Policy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-6 w-6 text-emerald-600" />
                Shipping Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We ship to all major cities in Pakistan. Shipping times may vary based on your location.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Standard shipping: 3-7 business days</li>
                <li>Shipping costs are calculated at checkout based on your location</li>
                <li>We are not responsible for delays caused by courier services</li>
                <li>Someone must be available to receive the delivery</li>
              </ul>
              <p className="text-gray-600">
                <strong>Delivery Issues:</strong> If your package is lost or damaged during transit, please contact us within 48 hours.
              </p>
            </CardContent>
          </Card>

          {/* Returns & Refunds */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-emerald-600" />
                Returns & Refunds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Our return policy is detailed on our dedicated Returns page. Key points:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Returns are accepted within 7 days of delivery</li>
                <li>Items must be in original condition with tags and packaging</li>
                <li>Refunds are processed within 5-7 business days after inspection</li>
                <li>Some items are non-returnable (see Returns page for details)</li>
              </ul>
              <p className="text-gray-600">
                For complete return information, please visit our <a href="/returns" className="text-emerald-600 hover:underline">Returns & Refunds</a> page.
              </p>
            </CardContent>
          </Card>

          {/* Prohibited Activities */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-emerald-600" />
                Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                You may not use our website for any unlawful purpose or in any way that could damage the website. 
                Prohibited activities include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Fraudulent orders or payments</li>
                <li>Using false or misleading information</li>
                <li>Attempting to manipulate prices or discounts</li>
                <li>Harassing or abusing our staff</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-emerald-600" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                To the fullest extent permitted by law, Alhamd Collection shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Damage to or viruses that may infect your computer equipment</li>
                <li>Errors or inaccuracies in product information</li>
              </ul>
              <p className="text-gray-600">
                Our total liability shall not exceed the amount you paid for the products in question.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-emerald-600" />
                Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We reserve the right to modify these Terms & Conditions at any time. Changes will be effective immediately 
                upon posting on the website. Your continued use of the website after changes constitutes acceptance of the updated terms.
              </p>
              <p className="text-gray-600">
                We encourage you to review these terms periodically for any changes.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mb-8 bg-emerald-50 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6 text-emerald-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                If you have any questions about these Terms & Conditions, please contact us:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li><strong>Email:</strong> alhamdcollection518@gmail.com</li>
                <li><strong>Phone:</strong> +92 317 1853183</li>
                <li><strong>Address:</strong> ALHAMD COLLECTION,ALJANNAT MARKET,ADDA MONGI BANGLA,GOJRA, PUNJAB, PAKISTAN</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
