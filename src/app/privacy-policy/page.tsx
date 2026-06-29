import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Cookie, Server, UserCheck, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Alhamd Collection',
  description: 'Learn how Alhamd Collection protects your privacy and handles your personal information.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'June 28, 2026';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-emerald-700 to-teal-700 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-emerald-100">Your privacy is important to us</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                Last Updated: {lastUpdated}
              </p>
              <p className="text-gray-700 leading-relaxed">
                At Alhamd Collection, we are committed to protecting your personal information and your right to privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
                and make purchases.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-emerald-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li><strong>Name and Contact Information:</strong> Full name, email address, phone number</li>
                <li><strong>Shipping Address:</strong> Street address, city, state, postal code, country</li>
                <li><strong>Order Information:</strong> Products purchased, order details, purchase history</li>
                <li><strong>Payment Information:</strong> Payment method selection (we do not store card details)</li>
                <li><strong>Account Information:</strong> Username, password (encrypted), preferences</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-emerald-600" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Process, fulfill, and deliver your orders</li>
                <li>Send you order confirmations and shipping updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Improve our website, products, and services</li>
                <li>Send you promotional emails (with your consent)</li>
                <li>Prevent fraud and protect against unauthorized transactions</li>
              </ul>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-6 w-6 text-emerald-600" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                <strong>We do not store your credit card or payment credentials.</strong>
              </p>
              <p className="text-gray-600">
                For Cash on Delivery orders, we only collect your shipping and contact information. 
                For EasyPaisa/JazzCash payments, payment screenshots are used solely for order verification 
                and are not stored or shared with third parties.
              </p>
              <p className="text-gray-600">
                All payment processing is handled securely through trusted payment gateways.
              </p>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-6 w-6 text-emerald-600" />
                Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We use cookies and similar tracking technologies to track activity on our website and hold certain information.
              </p>
              <p className="text-gray-600">
                Cookies are files with a small amount of data which may include an anonymous unique identifier. 
                Cookies are sent to your browser from the website and stored on your device.
              </p>
              <p className="text-gray-600">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                However, if you do not accept cookies, you may not be able to use some portions of our website.
              </p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-emerald-600" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized or unlawful processing, accidental loss, destruction, or damage.
              </p>
              <p className="text-gray-600">
                However, no method of transmission over the Internet or electronic storage is 100% secure. 
                While we strive to use commercially acceptable means to protect your personal information, 
                we cannot guarantee its absolute security.
              </p>
            </CardContent>
          </Card>

          {/* Third Party Services */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-6 w-6 text-emerald-600" />
                Third Party Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We may employ third-party companies and services to facilitate our website, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Payment processing services</li>
                <li>Shipping and delivery services</li>
                <li>Email marketing services</li>
                <li>Analytics services</li>
              </ul>
              <p className="text-gray-600">
                These third parties have access to your personal information only to perform specific tasks on our behalf 
                and are obligated not to disclose or use it for any other purpose.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-emerald-600" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Access and update your personal information through your account</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Object to processing of your personal information</li>
              </ul>
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
                If you have any questions about this Privacy Policy, please contact us:
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
