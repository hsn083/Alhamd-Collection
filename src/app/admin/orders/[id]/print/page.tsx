'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PrintOrderPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then(data => { if (data.success) setOrder(data.order); })
      .finally(() => setIsLoading(false));
  }, [orderId]);

  useEffect(() => {
    if (order && !isLoading) {
      setTimeout(() => window.print(), 500);
    }
  }, [order, isLoading]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
    </div>
  );

  if (!order) return <div className="p-8 text-center text-gray-400">Order not found</div>;

  const statusLabels: Record<string, string> = {
    pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing',
    packed: 'Packed', shipped: 'Shipped', in_transit: 'In Transit',
    out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
    cancelled: 'Cancelled', returned: 'Returned', refunded: 'Refunded',
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '40px', color: '#111827' }}>
      <style>{`@media print { @page { margin: 20px; } body { -webkit-print-color-adjust: exact; } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', paddingBottom: '20px', borderBottom: '2px solid #0F766E' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#0F766E' }}>ALHAMD<span style={{ color: '#D4AF37' }}> Collection</span></h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>Premium Clothing & Shoes</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>ORDER SLIP</p>
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#6B7280', fontFamily: 'monospace' }}>{order.id}</p>
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#6B7280' }}>{new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div style={{ display: 'inline-block', padding: '6px 16px', background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '20px', marginBottom: '24px' }}>
        <span style={{ color: '#065F46', fontWeight: 600, fontSize: '13px' }}>Status: {statusLabels[order.status] || order.status}</span>
      </div>

      {/* Customer + Delivery in 2 cols */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer</h3>
          <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 600 }}>{order.user?.name}</p>
          <p style={{ margin: '4px 0', fontSize: '13px', color: '#6B7280' }}>{order.user?.email}</p>
          <p style={{ margin: '4px 0', fontSize: '13px', color: '#6B7280' }}>{order.user?.phone}</p>
        </div>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deliver To</h3>
          <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 600 }}>{order.address?.fullName}</p>
          <p style={{ margin: '4px 0', fontSize: '13px', color: '#6B7280' }}>{order.address?.address}</p>
          <p style={{ margin: '4px 0', fontSize: '13px', color: '#6B7280' }}>{order.address?.city}, {order.address?.province}</p>
          <p style={{ margin: '4px 0', fontSize: '13px', color: '#6B7280' }}>{order.address?.phone}</p>
        </div>
      </div>

      {/* Shipping */}
      <div style={{ background: '#ecfdf5', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1fae5', marginBottom: '24px', display: 'flex', gap: '32px' }}>
        <div><span style={{ fontSize: '12px', color: '#6B7280' }}>Courier: </span><strong style={{ fontSize: '13px' }}>{order.shipping?.courier || 'TCS'}</strong></div>
        <div><span style={{ fontSize: '12px', color: '#6B7280' }}>Method: </span><strong style={{ fontSize: '13px', textTransform: 'capitalize' }}>{order.shipping?.method || 'Standard'}</strong></div>
        <div><span style={{ fontSize: '12px', color: '#6B7280' }}>Payment: </span><strong style={{ fontSize: '13px', textTransform: 'capitalize' }}>{order.paymentMethod?.replace('_', ' ')}</strong></div>
        {order.shipping?.trackingNumber && <div><span style={{ fontSize: '12px', color: '#6B7280' }}>Tracking: </span><strong style={{ fontSize: '13px', fontFamily: 'monospace' }}>{order.shipping.trackingNumber}</strong></div>}
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <thead>
          <tr style={{ background: '#0F766E', color: '#fff' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}>Item</th>
            <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, width: '80px' }}>Qty</th>
            <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, width: '120px' }}>Price</th>
            <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, width: '120px' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item: any, i: number) => (
            <tr key={i} style={{ borderBottom: '1px solid #e5e7eb', background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
              <td style={{ padding: '10px 12px', fontSize: '13px' }}>
                <div style={{ fontWeight: 600 }}>{item.product?.name}</div>
                {item.product?.brand && <div style={{ fontSize: '11px', color: '#6B7280' }}>{item.product.brand}</div>}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '13px' }}>{item.quantity}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px' }}>PKR {item.price?.toLocaleString()}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>PKR {(item.price * item.quantity)?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {order.discount > 0 && (
            <tr>
              <td colSpan={3} style={{ padding: '8px 12px', textAlign: 'right', fontSize: '13px', color: '#059669' }}>Discount</td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '13px', color: '#059669' }}>-PKR {order.discount?.toLocaleString()}</td>
            </tr>
          )}
          <tr>
            <td colSpan={3} style={{ padding: '8px 12px', textAlign: 'right', fontSize: '13px', color: '#6B7280' }}>Shipping</td>
            <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '13px' }}>PKR {order.shipping?.cost?.toLocaleString() || 0}</td>
          </tr>
          <tr style={{ borderTop: '2px solid #0F766E' }}>
            <td colSpan={3} style={{ padding: '12px', textAlign: 'right', fontSize: '15px', fontWeight: 700 }}>TOTAL</td>
            <td style={{ padding: '12px', textAlign: 'right', fontSize: '15px', fontWeight: 700, color: '#0F766E' }}>PKR {order.total?.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      {/* Footer */}
      <div style={{ textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '16px', color: '#9CA3AF', fontSize: '12px' }}>
        <p style={{ margin: 0 }}>Thank you for shopping with AlhamdCollection! For support: info@alhamdcollection.pk</p>
        <p style={{ margin: '4px 0 0' }}>alhamdcollection.pk · Style Meets Comfort</p>
      </div>
    </div>
  );
}
