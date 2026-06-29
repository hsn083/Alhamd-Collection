'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
// Footer replaced by AdminLayout
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  User,
  Lock,
  Mail,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function AdminAccountPage() {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Username update form
  const [usernameForm, setUsernameForm] = useState({
    currentPassword: '',
    newUsername: '',
  });

  // Password update form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Email update form
  const [emailForm, setEmailForm] = useState({
    currentPassword: '',
    newEmail: '',
    recoveryEmail: '',
  });

  useEffect(() => {
    fetchAdminUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAdminUser = async () => {
    try {
      const adminUserStr = localStorage.getItem('adminUser');
      if (adminUserStr) {
        const user = JSON.parse(adminUserStr);
        setAdminUser(user);
        setEmailForm({ ...emailForm, newEmail: user.email, recoveryEmail: user.recoveryEmail || '' });
      }
    } catch (error) {
      console.error('Error fetching admin user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setNotification(null);

    try {
      const response = await fetch('/api/admin/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: adminUser.id,
          currentPassword: usernameForm.currentPassword,
          updateType: 'username',
          newUsername: usernameForm.newUsername,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local storage
        const updatedUser = { ...adminUser, username: usernameForm.newUsername };
        localStorage.setItem('adminUser', JSON.stringify(updatedUser));
        setAdminUser(updatedUser);
        setUsernameForm({ currentPassword: '', newUsername: '' });
        showNotification('success', 'Username updated successfully');
      } else {
        showNotification('error', data.error || 'Failed to update username');
      }
    } catch (error) {
      showNotification('error', 'An error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setNotification(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('error', 'Passwords do not match');
      setIsUpdating(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showNotification('error', 'Password must be at least 8 characters');
      setIsUpdating(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: adminUser.id,
          currentPassword: passwordForm.currentPassword,
          updateType: 'password',
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showNotification('success', 'Password updated successfully. Please login again.');
        
        // Logout after password change
        setTimeout(() => {
          localStorage.removeItem('adminAuth');
          localStorage.removeItem('adminUser');
          document.cookie = 'adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          window.location.href = '/admin/login';
        }, 2000);
      } else {
        showNotification('error', data.error || 'Failed to update password');
      }
    } catch (error) {
      showNotification('error', 'An error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setNotification(null);

    try {
      const response = await fetch('/api/admin/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: adminUser.id,
          currentPassword: emailForm.currentPassword,
          updateType: 'email',
          newEmail: emailForm.newEmail,
          recoveryEmail: emailForm.recoveryEmail,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedUser = { ...adminUser, email: emailForm.newEmail, recoveryEmail: emailForm.recoveryEmail };
        localStorage.setItem('adminUser', JSON.stringify(updatedUser));
        setAdminUser(updatedUser);
        setEmailForm({ ...emailForm, currentPassword: '' });
        showNotification('success', 'Email updated successfully');
      } else {
        showNotification('error', data.error || 'Failed to update email');
      }
    } catch (error) {
      showNotification('error', 'An error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
                </main>
      </AdminLayout>
    );
  }

  return (
      <AdminLayout><div className="p-8">
        <div className="mb-8 pb-6 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <Button 
                  variant="ghost" 
                  className="text-gray-500 hover:bg-gray-50 mb-4"
                  onClick={() => window.location.href = '/admin'}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
                <h1 className="text-xl font-bold text-gray-900">Admin Account Settings</h1>
                <p className="text-sm text-gray-500">Manage your admin credentials and security</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Current User Info */}
          <Card className="mb-6 border border-emerald-100 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-emerald-700 flex items-center">
                <User className="mr-2 h-5 w-5" />
                Current Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Username</Label>
                  <p className="text-lg font-semibold">{adminUser?.username}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="text-lg font-semibold">{adminUser?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Login</Label>
                  <p className="text-lg font-semibold">
                    {adminUser?.lastLogin ? new Date(adminUser.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="username" className="space-y-6">
            <TabsList className="bg-white border border-emerald-200">
              <TabsTrigger value="username" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black">
                <User className="mr-2 h-4 w-4" />
                Username
              </TabsTrigger>
              <TabsTrigger value="password" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black">
                <Lock className="mr-2 h-4 w-4" />
                Password
              </TabsTrigger>
              <TabsTrigger value="email" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>

            {/* Username Update */}
            <TabsContent value="username">
              <Card className="border border-emerald-100 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-700">Change Username</CardTitle>
                  <p className="text-sm text-muted-foreground">Update your admin username</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUsernameUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="current-password-username">Current Password *</Label>
                      <Input
                        id="current-password-username"
                        type="password"
                        placeholder="Enter current password"
                        value={usernameForm.currentPassword}
                        onChange={(e) => setUsernameForm({ ...usernameForm, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-username">New Username *</Label>
                      <Input
                        id="new-username"
                        type="text"
                        placeholder="Enter new username"
                        value={usernameForm.newUsername}
                        onChange={(e) => setUsernameForm({ ...usernameForm, newUsername: e.target.value })}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Username'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Password Update */}
            <TabsContent value="password">
              <Card className="border border-emerald-100 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-700">Change Password</CardTitle>
                  <p className="text-sm text-muted-foreground">Update your admin password</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password *</Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="Enter current password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password *</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password (min 8 characters)"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                        minLength={8}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password *</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                        minLength={8}
                      />
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg flex items-start space-x-2">
                      <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-xs text-blue-700">
                        <p className="font-medium">Security Note:</p>
                        <p>After changing your password, you will be logged out and need to login again.</p>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Update */}
            <TabsContent value="email">
              <Card className="border border-emerald-100 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-700">Change Email</CardTitle>
                  <p className="text-sm text-muted-foreground">Update your admin and recovery email</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmailUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="current-password-email">Current Password *</Label>
                      <Input
                        id="current-password-email"
                        type="password"
                        placeholder="Enter current password"
                        value={emailForm.currentPassword}
                        onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-email">New Email *</Label>
                      <Input
                        id="new-email"
                        type="email"
                        placeholder="Enter new email"
                        value={emailForm.newEmail}
                        onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="recovery-email">Recovery Email (Optional)</Label>
                      <Input
                        id="recovery-email"
                        type="email"
                        placeholder="Enter recovery email for password reset"
                        value={emailForm.recoveryEmail}
                        onChange={(e) => setEmailForm({ ...emailForm, recoveryEmail: e.target.value })}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Email'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
            notification.type === 'success' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 hover:opacity-80"
            >
              ×
            </button>
          </div>
        )}
      </div></AdminLayout>
  );
}
