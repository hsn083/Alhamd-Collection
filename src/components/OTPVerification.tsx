'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mail, 
  Lock, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  orderId?: string;
  onVerified: () => void;
  onCancel: () => void;
}

export default function OTPVerification({ email, orderId, onVerified, onCancel }: OTPVerificationProps) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); // 1 minute
  const [cooldownRemaining, setCooldownRemaining] = useState(0); // resend cooldown
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Refs to prevent duplicate calls in React Strict Mode
  const hasSentInitialOTP = useRef(false);
  const isSendingRef = useRef(false);
  
  // Normalize email for consistency
  const normalizedEmail = email.toLowerCase().trim();
  console.log('[FRONTEND] OTPVerification mounted with email:', normalizedEmail, '(original:', email, ')');

  // Countdown timer for code expiry
  useEffect(() => {
    if (timeRemaining > 0 && !success) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, success]);
  
  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldownRemaining > 0 && !success) {
      const timer = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownRemaining, success]);

  // Send OTP on mount (prevented from running twice in React Strict Mode)
  useEffect(() => {
    if (!hasSentInitialOTP.current) {
      hasSentInitialOTP.current = true;
      sendOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendOTP = async () => {
    // Prevent multiple simultaneous sends
    if (isSendingRef.current) {
      console.log('[FRONTEND] sendOTP called but already sending');
      return;
    }
    
    isSendingRef.current = true;
    setIsResending(true);
    setError('');
    
    console.log('[FRONTEND] Sending OTP request for email:', normalizedEmail);
    
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, orderId }),
      });

      const data = await response.json();
      console.log('[FRONTEND] OTP send response:', data);

      if (data.success) {
        setTimeRemaining(data.expiresIn || 60);
        setCooldownRemaining(data.cooldownRemaining || 10);
        setCanResend(false);
      } else {
        // Handle cooldown error from backend
        if (data.cooldownRemaining) {
          setCooldownRemaining(data.cooldownRemaining);
          setCanResend(false);
        }
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('[FRONTEND] OTP send error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
      isSendingRef.current = false;
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    
    console.log('[FRONTEND] Verifying OTP for email:', normalizedEmail, 'OTP:', otp);

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, otp }),
      });

      const data = await response.json();
      console.log('[FRONTEND] OTP verify response:', data);

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onVerified();
        }, 1000);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      console.error('[FRONTEND] OTP verify error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    // Prevent resend if already sending or in cooldown
    if (isSendingRef.current || !canResend) {
      return;
    }
    setOtp('');
    sendOTP();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 6) {
      setOtp(numericValue);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle className="text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">Email Verification</h2>
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit code to
              </p>
              <p className="text-sm font-semibold text-green-600">{normalizedEmail}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-green-600">Verification Successful!</p>
              <p className="text-sm text-muted-foreground">Redirecting...</p>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="otp">Enter Verification Code</Label>
                <div className="mt-2">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>
                    {timeRemaining > 0 ? (
                      <>Expires in {formatTime(timeRemaining)}</>
                    ) : (
                      <>Code expired</>
                    )}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResend}
                  disabled={!canResend || isResending || isSendingRef.current}
                  className="text-green-600 hover:text-green-700"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Code
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium">Tips:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Check your spam folder if you don't see the email</li>
                    <li>The code is valid for 1 minute</li>
                    <li>You can request a new code after 10 seconds</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={isLoading || otp.length !== 6}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
