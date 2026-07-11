'use client';

import { useEffect } from 'react';

interface TawkToChatProps {
  propertyId?: string;
  widgetId?: string;
}

export function TawkToChat({ propertyId = 'default', widgetId = 'default' }: TawkToChatProps) {
  useEffect(() => {
    // Check if Tawk.to script is already loaded
    if (typeof window !== 'undefined' && (window as any).Tawk_API) {
      return;
    }

    // Load Tawk.to script
    const script = document.createElement('script');
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(`script[src="https://embed.tawk.to/${propertyId}/${widgetId}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [propertyId, widgetId]);

  return null;
}

// Custom hook to control Tawk.to chat
export function useTawkTo() {
  const openChat = () => {
    if (typeof window !== 'undefined' && (window as any).Tawk_API) {
      (window as any).Tawk_API.maximize();
    }
  };

  const closeChat = () => {
    if (typeof window !== 'undefined' && (window as any).Tawk_API) {
      (window as any).Tawk_API.minimize();
    }
  };

  const toggleChat = () => {
    if (typeof window !== 'undefined' && (window as any).Tawk_API) {
      (window as any).Tawk_API.toggle();
    }
  };

  const setVisitor = (visitorData: { name?: string; email?: string; hash?: string }) => {
    if (typeof window !== 'undefined' && (window as any).Tawk_API) {
      (window as any).Tawk_API.visitor = visitorData;
    }
  };

  const setAttributes = (attributes: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).Tawk_API) {
      (window as any).Tawk_API.setAttributes(attributes, (error: any) => {
        if (error) {
          console.error('Error setting Tawk.to attributes:', error);
        }
      });
    }
  };

  const onChatLoaded = (callback: () => void) => {
    if (typeof window !== 'undefined') {
      (window as any).Tawk_API = (window as any).Tawk_API || {};
      (window as any).Tawk_API.onLoad = callback;
    }
  };

  const onChatStarted = (callback: () => void) => {
    if (typeof window !== 'undefined') {
      (window as any).Tawk_API = (window as any).Tawk_API || {};
      (window as any).Tawk_API.onChatStarted = callback;
    }
  };

  const onChatEnded = (callback: () => void) => {
    if (typeof window !== 'undefined') {
      (window as any).Tawk_API = (window as any).Tawk_API || {};
      (window as any).Tawk_API.onChatEnded = callback;
    }
  };

  return {
    openChat,
    closeChat,
    toggleChat,
    setVisitor,
    setAttributes,
    onChatLoaded,
    onChatStarted,
    onChatEnded,
  };
}
