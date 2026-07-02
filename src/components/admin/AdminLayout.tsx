'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag,
  Settings, Image, LogOut, ChevronRight, Ticket, Bell, Shield,
  AlertTriangle, X
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/hero-banners', label: 'Hero Banners', icon: Image },
  { href: '/admin/low-stock', label: 'Low Stock', icon: AlertTriangle },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/settings/account', label: 'Admin Account', icon: Shield },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/admin/stock-alerts');
      const data = await response.json();
      if (data.success) {
        setAlerts(data.alerts);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      await fetch('/api/admin/stock-alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', alertId }),
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const clearAllAlerts = async () => {
    try {
      await fetch('/api/admin/stock-alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_all' }),
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error clearing alerts:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    document.cookie = 'adminAuth=; path=/; max-age=0';
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm fixed h-full z-30">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="block">
              <span className="text-lg font-extrabold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent tracking-tight">
                ALHAMD
              </span>
              <span className="ml-1 text-xs font-semibold text-yellow-600 tracking-widest uppercase">
                Admin
              </span>
            </Link>
            {/* Notification Bell */}
            <div className="relative">
              <button
                ref={bellButtonRef}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown - Fixed Position */}
              {showNotifications && (
                <div className="fixed left-64 top-16 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-[9999] animate-in slide-in-from-top-2 duration-200">
                  <div ref={notificationRef}>
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Stock Alerts</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllAlerts();
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {alerts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No stock alerts
                        </div>
                      ) : (
                        alerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !alert.isRead ? 'bg-amber-50' : ''
                            }`}
                            onClick={() => {
                              if (!alert.isRead) markAsRead(alert.id);
                              setShowNotifications(false);
                              window.location.href = `/admin/products`;
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                alert.alertType === 'out_of_stock' 
                                  ? 'bg-red-100' 
                                  : 'bg-amber-100'
                              }`}>
                                <AlertTriangle className={`h-4 w-4 ${
                                  alert.alertType === 'out_of_stock' 
                                    ? 'text-red-600' 
                                    : 'text-amber-600'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {alert.productName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {alert.alertType === 'out_of_stock' 
                                    ? 'Out of stock' 
                                    : `Only ${alert.currentQuantity} left`}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(alert.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Store Management Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-700'
                  }`}
                >
                  <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'}`} />
                  {item.label}
                  {isActive && <ChevronRight className="ml-auto h-3 w-3 text-emerald-500" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-emerald-700 rounded-lg hover:bg-gray-50 transition-colors mb-1">
            <Bell className="h-4 w-4" /> View Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
