'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCartStore } from '@/store/cartStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useEnabledPaymentMethods } from '@/hooks/useSettings';
import OTPVerification from '@/components/OTPVerification';
import { 
  Truck, 
  CreditCard, 
  Smartphone, 
  Landmark, 
  CheckCircle,
  AlertCircle,
  Loader2,
  User
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, total, couponCode, clearCart } = useCartStore();
  const { settings } = useSettingsStore();
  const enabledPaymentMethods = useEnabledPaymentMethods();
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    province: '',
    city: '',
    houseNumber: '',
    street: '',
    area: '',
    landmark: '',
    postalCode: '',
    notes: '',
  });
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Do not auto-select payment method - user must explicitly select
  // useEffect(() => {
  //   if (enabledPaymentMethods.length > 0 && !paymentMethod) {
  //     const firstMethod = enabledPaymentMethods[0][0]; // Get the key of first enabled method
  //     setPaymentMethod(firstMethod);
  //   }
  // }, [enabledPaymentMethods, paymentMethod]);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/login');
      const data = await response.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
        // Prefill form with user data
        setFormData(prev => ({
          ...prev,
          fullName: data.user.fullName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
        }));
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const provinces = [
    'Punjab',
    'Sindh',
    'Khyber Pakhtunkhwa (KPK)',
    'Balochistan',
    'Islamabad Capital Territory (ICT)',
    'Azad Jammu & Kashmir (AJK)',
    'Gilgit Baltistan (GB)'
  ];

  const provinceCities: { [key: string]: string[] } = {
    'Punjab': [
      'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot',
      'Bahawalpur', 'Sargodha', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Vehari',
      'Mian Channu', 'Khanewal', 'Okara', 'Pakpattan', 'Sahiwal', 'Kasur',
      'Attock', 'Chakwal', 'Mandi Bahauddin', 'Gujrat', 'Narowal', 'Hafizabad',
      'Toba Tek Singh', 'Dera Ghazi Khan', 'Muzaffargarh', 'Layyah', 'Bhakkar', 'Lodhran'
    ],
    'Sindh': [
      'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Mirpur Khas', 'Nawabshah',
      'Jacobabad', 'Khairpur', 'Thatta', 'Badin'
    ],
    'Khyber Pakhtunkhwa (KPK)': [
      'Peshawar', 'Mardan', 'Abbottabad', 'Swat', 'Kohat', 'Dera Ismail Khan',
      'Mansehra', 'Bannu', 'Haripur'
    ],
    'Balochistan': [
      'Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Chaman', 'Sibi'
    ],
    'Azad Jammu & Kashmir (AJK)': [
      'Muzaffarabad', 'Mirpur', 'Kotli', 'Bagh', 'Rawalakot'
    ],
    'Gilgit Baltistan (GB)': [
      'Gilgit', 'Skardu', 'Hunza', 'Ghizer', 'Diamer'
    ],
    'Islamabad Capital Territory (ICT)': [
      'Islamabad'
    ]
  };

  const [manualCityEntry, setManualCityEntry] = useState(false);

  // Get cities for selected province
  const availableCities = formData.province ? provinceCities[formData.province] || [] : [];

  // Province-based shipping rates from settings
  const provinceShippingRates = settings.provinces;

  const shippingCost = formData.province 
    ? (shippingMethod === 'express' 
        ? provinceShippingRates[formData.province]?.express || settings.shipping.expressShippingCost 
        : provinceShippingRates[formData.province]?.standard || settings.shipping.standardShippingCost)
    : (shippingMethod === 'express' ? settings.shipping.expressShippingCost : settings.shipping.standardShippingCost);
  
  // Check if free shipping applies
  const freeShippingThreshold = settings.shipping.freeShippingThreshold;
  const actualShippingCost = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const finalTotal = subtotal - discount + actualShippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.phone || 
          !formData.province || !formData.city || 
          !formData.houseNumber || !formData.street || !formData.area) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Validate phone number (Pakistan format)
      const phoneRegex = /^(\+92|0)?[3-9]\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError('Please enter a valid Pakistan phone number (e.g., 03001234567)');
        setIsLoading(false);
        return;
      }

      // Validate payment method is selected
      if (!paymentMethod) {
        setError('Please select payment method first');
        setIsLoading(false);
        return;
      }

      // Validate payment screenshot for Easypaisa and JazzCash
      if ((paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash' || paymentMethod === 'bankTransfer') && !paymentScreenshot) {
        setError('Please upload payment screenshot before placing your order.');
        setIsLoading(false);
        return;
      }

      // Show OTP verification before placing order
      setShowOTPVerification(true);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing your order');
      setIsLoading(false);
    }
  };

  const handleOTPVerified = async () => {
    setIsLoading(true);
    setShowOTPVerification(false);

    try {
      if (paymentMethod === 'stripe') {
        // Process Stripe payment
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Stripe failed to initialize');
        }

        const response = await fetch('/api/payment/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            amount: finalTotal,
            currency: 'pkr',
            customerInfo: formData,
            shippingMethod,
            shippingCost,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment session');
        }

        // Redirect to Stripe checkout
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else if (data.sessionId) {
          const stripeJs = await import('@stripe/stripe-js');
          const stripe = await stripeJs.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');
          if (stripe) {
           if (data.url) {
    window.location.href = data.url;
} else {
    throw new Error('Stripe checkout URL not found');
}
          }
        } else {
          throw new Error('No checkout URL or session ID returned');
        }
      } else {
        // Handle local payment methods (COD, JazzCash, EasyPaisa, Bank Transfer)
        
        // Upload payment screenshot if provided
        let screenshotUrl = '';
        if (paymentScreenshot && (paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa' || paymentMethod === 'bankTransfer')) {
          const formDataUpload = new FormData();
          formDataUpload.append('file', paymentScreenshot);
          formDataUpload.append('orderId', 'temp'); // Will be updated after order creation
          
          const uploadResponse = await fetch('/api/upload/payment-screenshot', {
            method: 'POST',
            body: formDataUpload,
          });
          
          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json();
            throw new Error(uploadError.error || 'Failed to upload payment screenshot');
          }
          
          const uploadData = await uploadResponse.json();
          if (!uploadData.url) {
            throw new Error('Screenshot upload did not return a valid URL');
          }
          screenshotUrl = uploadData.url;
        }

        // Determine payment status and order status
        let paymentStatus = 'pending_payment';
        let orderStatus = 'pending';
        
        if (paymentMethod === 'cod') {
          paymentStatus = 'pending_payment';
          orderStatus = 'confirmed';
        } else if (screenshotUrl) {
          paymentStatus = 'under_verification';
          orderStatus = 'pending';
        }

        // Record coupon usage if coupon was applied
        if (couponCode) {
          try {
            await fetch('/api/coupons/use', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: couponCode }),
            });
          } catch (error) {
            console.error('Failed to record coupon usage:', error);
          }
        }

        // Create order
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: {
              userId: user?.id || 'guest',
              user: user || {
                id: 'guest',
                name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                addresses: [],
                wishlist: [],
                createdAt: new Date(),
              },
              items: items.map(item => ({
                product: item.product,
                name: item.product.name,
                image: item.product.images?.[0] || '',
                quantity: item.quantity,
                price: item.product.discountPrice || item.product.price,
              })),
              status: orderStatus,
              paymentMethod: paymentMethod === 'cod' ? 'cod' : 
                           paymentMethod === 'jazzcash' ? 'jazzcash' :
                           paymentMethod === 'easypaisa' ? 'easypaisa' : 'bank_transfer',
              paymentStatus: paymentStatus,
              paymentScreenshot: screenshotUrl || undefined,
              transactionId: transactionId || undefined,
              shipping: {
                method: shippingMethod,
                courier: 'TCS',
                cost: shippingCost,
              },
              address: {
                id: 'temp',
                fullName: formData.fullName,
                phone: formData.phone,
                city: formData.city,
                province: formData.province,
                address: `${formData.houseNumber}, ${formData.street}, ${formData.area}${formData.landmark ? `, Near ${formData.landmark}` : ''}${formData.postalCode ? `, ${formData.postalCode}` : ''}`,
                zipCode: formData.postalCode || '',
                isDefault: false,
              },
              subtotal,
              discount,
              total: finalTotal,
              couponCode: couponCode || undefined,
              couponDiscount: discount || undefined,
              finalAmount: finalTotal,
              notes: formData.notes,
            },
            transaction: {
              orderId: '',
              userId: user?.id || 'guest',
              amount: finalTotal,
              currency: 'pkr',
              paymentMethod: paymentMethod === 'cod' ? 'cod' : 
                           paymentMethod === 'jazzcash' ? 'jazzcash' :
                           paymentMethod === 'easypaisa' ? 'easypaisa' : 'bank_transfer',
              paymentGatewayId: 'pending',
              status: paymentStatus === 'payment_submitted' ? 'completed' : 'pending',
              metadata: formData,
            },
          }),
        });

        const orderData = await orderResponse.json();

        console.log('Order API response:', orderData);

        if (!orderResponse.ok) {
          throw new Error(orderData.error || 'Failed to create order');
        }

        // Verify order was created with an ID
        const orderId = orderData.orderId || orderData.order?._id;
        if (!orderId) {
          console.error('No orderId in response:', orderData);
          throw new Error('Order was created but no order ID was returned');
        }

        // Save customer email to localStorage for My Orders page
        localStorage.setItem('customerEmail', formData.email);

        // Clear cart and redirect to order confirmation page
        clearCart();
        router.push(`/order-confirmation/${orderId}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing your order');
      setIsLoading(false);
    }
  };

  const handleOTPCancel = () => {
    setShowOTPVerification(false);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid file (JPG, JPEG, PNG, WEBP, or PDF)');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setPaymentScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cod': return 'Cash on Delivery';
      case 'jazzcash': return 'JazzCash';
      case 'easypaisa': return 'EasyPaisa';
      case 'bank_transfer': return 'Bank Transfer';
      default: return method;
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponInput.trim(),
          cartTotal: subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setCouponError(data.message || 'Invalid coupon code');
        return;
      }

      // Apply coupon using cart store
      useCartStore.getState().applyCoupon(data.couponCode, data.discountAmount);
      setCouponSuccess(`Coupon applied successfully! ${data.discountType === 'percentage' ? data.value + '% OFF' : 'PKR ' + data.discountAmount.toLocaleString() + ' OFF'}`);
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err.message || 'Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    useCartStore.getState().removeCoupon();
    setCouponSuccess(null);
    setCouponError(null);
  };

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <Button onClick={() => window.location.href = '/shop'}>Continue Shopping</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      {showOTPVerification && (
        <OTPVerification
          email={formData.email}
          onVerified={handleOTPVerified}
          onCancel={handleOTPCancel}
        />
      )}
      
      <main className="min-h-screen">
        <div className="bg-muted/30 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">Complete your order</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Mobile Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+92 3XX XXXXXXX"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="province">Province *</Label>
                        <select
                          id="province"
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={formData.province}
                          onChange={(e) => {
                            setFormData({ ...formData, province: e.target.value, city: '' });
                            setManualCityEntry(false);
                          }}
                        >
                          <option value="">Select Province</option>
                          {provinces.map((prov: string) => (
                            <option key={prov} value={prov}>{prov}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="city">City *</Label>
                        {!manualCityEntry ? (
                          <select
                            id="city"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            disabled={!formData.province}
                          >
                            <option value="">Select City</option>
                            {availableCities.map((city: string) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            id="city"
                            required
                            placeholder="Enter city name"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="manualCityEntry"
                        checked={manualCityEntry}
                        onChange={(e) => {
                          setManualCityEntry(e.target.checked);
                          setFormData({ ...formData, city: '' });
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="manualCityEntry" className="text-sm cursor-pointer">
                        My city is not listed
                      </Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="houseNumber">House Number *</Label>
                        <Input
                          id="houseNumber"
                          required
                          placeholder="House/Flat #"
                          value={formData.houseNumber}
                          onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="street">Street *</Label>
                        <Input
                          id="street"
                          required
                          placeholder="Street name"
                          value={formData.street}
                          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="area">Area / Sector *</Label>
                      <Input
                        id="area"
                        required
                        placeholder="Area, Sector, or Neighborhood"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="landmark">Landmark (Optional)</Label>
                        <Input
                          id="landmark"
                          placeholder="Nearby landmark"
                          value={formData.landmark}
                          onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code (Optional)</Label>
                        <Input
                          id="postalCode"
                          placeholder="Postal code"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg mb-3">
                        <RadioGroupItem value="standard" id="standard" />
                        <label htmlFor="standard" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Truck className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">Standard Delivery</p>
                                <p className="text-sm text-muted-foreground">{settings.shipping.deliveryTime}</p>
                              </div>
                            </div>
                            <span className="font-medium">
                              {actualShippingCost === 0 ? 'FREE' : `PKR ${shippingCost}`}
                            </span>
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value="express" id="express" />
                        <label htmlFor="express" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Truck className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">Express Delivery</p>
                                <p className="text-sm text-muted-foreground">1-2 business days</p>
                              </div>
                            </div>
                            <span className="font-medium">
                              PKR {formData.province ? provinceShippingRates[formData.province]?.express : settings.shipping.expressShippingCost}
                            </span>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                    {subtotal >= freeShippingThreshold && (
                      <p className="text-sm text-emerald-600 mt-3">
                        ✓ Free shipping applied (Order above PKR {freeShippingThreshold})
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      {enabledPaymentMethods.map(([methodKey, methodData]) => (
                        <div key={methodKey} className="flex items-center space-x-3 p-4 border rounded-lg mb-3">
                          <RadioGroupItem value={methodKey} id={methodKey} />
                          <label htmlFor={methodKey} className="flex-1 cursor-pointer">
                            <div className="flex items-center space-x-3">
                              {methodKey === 'cashOnDelivery' && <CreditCard className="h-5 w-5 text-primary" />}
                              {methodKey === 'bankTransfer' && <Landmark className="h-5 w-5 text-primary" />}
                              {(methodKey === 'jazzcash' || methodKey === 'easypaisa') && <Smartphone className="h-5 w-5 text-primary" />}
                              {(methodKey === 'stripe' || methodKey === 'paypal') && <CreditCard className="h-5 w-5 text-primary" />}
                              <div>
                                <p className="font-medium">{methodData.displayName}</p>
                                <p className="text-sm text-muted-foreground">{methodData.instructions}</p>
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </RadioGroup>

                    {/* Manual Payment Details */}
                    {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa' || paymentMethod === 'bankTransfer') && (
                      <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Payment Details
                        </h4>
                        {paymentMethod === 'jazzcash' && settings.payments.jazzcash && (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Account Title:</span>
                              <span className="font-medium">{settings.payments.jazzcash.accountTitle}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Account Number:</span>
                              <span className="font-medium font-mono">{settings.payments.jazzcash.accountNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Receiver Name:</span>
                              <span className="font-medium">{settings.payments.jazzcash.receiverName}</span>
                            </div>
                          </div>
                        )}
                        {paymentMethod === 'easypaisa' && settings.payments.easypaisa && (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Account Title:</span>
                              <span className="font-medium">{settings.payments.easypaisa.accountTitle}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Account Number:</span>
                              <span className="font-medium font-mono">{settings.payments.easypaisa.accountNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Receiver Name:</span>
                              <span className="font-medium">{settings.payments.easypaisa.receiverName}</span>
                            </div>
                          </div>
                        )}
                        {paymentMethod === 'bankTransfer' && settings.payments.bankTransfer && (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Bank Name:</span>
                              <span className="font-medium">{settings.payments.bankTransfer.bankName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Account Title:</span>
                              <span className="font-medium">{settings.payments.bankTransfer.accountTitle}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Account Number:</span>
                              <span className="font-medium font-mono">{settings.payments.bankTransfer.accountNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">IBAN:</span>
                              <span className="font-medium font-mono text-xs">{settings.payments.bankTransfer.iban}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Branch:</span>
                              <span className="font-medium">{settings.payments.bankTransfer.branchName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Receiver Name:</span>
                              <span className="font-medium">{settings.payments.bankTransfer.receiverName}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment Screenshot Upload */}
                    {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa' || paymentMethod === 'bankTransfer') && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Upload Payment Screenshot
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="screenshot" className="text-sm">Payment Screenshot (JPG, JPEG, PNG, WEBP, PDF - Max 5MB)</Label>
                            <Input
                              id="screenshot"
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp,.pdf"
                              onChange={handleScreenshotChange}
                              className="mt-1"
                            />
                          </div>
                          {screenshotPreview && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600 mb-2">Preview:</p>
                              {paymentScreenshot?.type === 'application/pdf' ? (
                                <div className="p-3 bg-gray-100 rounded-lg flex items-center gap-2">
                                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                                  <span className="text-sm font-medium">{paymentScreenshot.name}</span>
                                </div>
                              ) : (
                                <div className="relative w-full h-40 bg-gray-100 rounded-lg border flex items-center justify-center">
                                  <Image src={screenshotPreview} alt="Payment Screenshot" fill className="object-contain rounded-lg" />
                                </div>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPaymentScreenshot(null);
                                  setScreenshotPreview(null);
                                }}
                                className="mt-2"
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                          <div>
                            <Label htmlFor="transactionId" className="text-sm">Transaction ID (Optional)</Label>
                            <Input
                              id="transactionId"
                              placeholder="Enter transaction ID from your payment receipt"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Notes (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Any special instructions for your order..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Coupon Section */}
                    <div className="border-b pb-4">
                      {!couponCode ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Have a coupon?</p>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter coupon code"
                              value={couponInput}
                              onChange={(e) => {
                                setCouponInput(e.target.value.toUpperCase());
                                setCouponError(null);
                                setCouponSuccess(null);
                              }}
                              onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                              disabled={isApplyingCoupon}
                            />
                            <Button
                              type="button"
                              onClick={handleApplyCoupon}
                              disabled={isApplyingCoupon}
                              size="sm"
                            >
                              {isApplyingCoupon ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Apply'
                              )}
                            </Button>
                          </div>
                          {couponError && (
                            <p className="text-sm text-red-600">{couponError}</p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="text-sm font-medium text-green-800">Coupon Applied ✅</p>
                                <p className="text-sm text-green-700 font-bold">{couponCode}</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveCoupon}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="mt-2 text-sm text-green-700">
                            - PKR {discount.toLocaleString()} Discount
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex items-center space-x-3">
                          <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            {item.product.images && item.product.images.length > 0 ? (
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-2xl">
                                🎮
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <span className="text-sm font-medium flex-shrink-0">
                            PKR {((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>PKR {subtotal.toLocaleString()}</span>
                      </div>
                      {discount > 0 && (
                        <>
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount ({couponCode})</span>
                            <span>-PKR {discount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm text-green-600">
                            <span className="text-muted-foreground">Coupon Discount</span>
                            <span>-PKR {discount.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Charges</span>
                        <span>PKR {shippingCost.toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total Amount</span>
                          <span className="text-primary">PKR {finalTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    {paymentMethod === 'stripe' && (
                      <div className="bg-blue-50 p-3 rounded-lg flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <p className="font-medium">Secure Card Payment</p>
                          <p className="text-xs">You'll be redirected to Stripe's secure checkout</p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'cod' && (
                      <div className="bg-blue-50 p-3 rounded-lg flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-xs">Pay when your order arrives</p>
                        </div>
                      </div>
                    )}

                    {(paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') && (
                      <div className="bg-green-50 p-3 rounded-lg flex items-start space-x-2">
                        <Smartphone className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="text-sm text-green-700">
                          <p className="font-medium">Mobile Payment</p>
                          <p className="text-xs">You'll receive payment instructions after order placement</p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'bank' && (
                      <div className="bg-purple-50 p-3 rounded-lg flex items-start space-x-2">
                        <Landmark className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div className="text-sm text-purple-700">
                          <p className="font-medium">Bank Transfer</p>
                          <p className="text-xs">Bank details will be provided after order placement</p>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 p-3 rounded-lg flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="text-sm text-red-700">
                          <p className="font-medium">Error</p>
                          <p className="text-xs">{error}</p>
                        </div>
                      </div>
                    )}

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        paymentMethod === 'stripe' ? 'Pay Now' : 'Place Order'
                      )}
                    </Button>

                    <div className="text-center text-xs text-muted-foreground">
                      <p>By placing this order, you agree to our Terms & Conditions</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
