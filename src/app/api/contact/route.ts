import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContactMessage from '@/models/ContactMessage';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    console.log('[CONTACT] New message received:', { name, email, subject });

    // Validation
    if (!name || !email || !subject || !message) {
      console.log('[CONTACT] Validation failed: Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[CONTACT] Validation failed: Invalid email format');
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Create contact message
    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      subject: subject.trim(),
      message: message.trim(),
      status: 'new',
    });

    console.log('[CONTACT] Message saved successfully:', contactMessage._id);

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      data: {
        id: contactMessage._id,
      },
    });
  } catch (error: any) {
    console.error('[CONTACT] Error saving message:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
