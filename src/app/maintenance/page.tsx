async function getSettings() {
  try {
    // Use relative URL for internal API call during runtime
    const response = await fetch('/api/settings', {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return data.settings;
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
  }
  return null;
}

export default async function MaintenancePage() {
  const settings = await getSettings();
  
  const general = settings?.general || {
    maintenanceMessage: 'We are currently performing maintenance. Please check back soon.',
    contactEmail: 'info@alhamdcollection.pk',
    phoneNumber: '+92 300 1234567',
    siteName: 'AlhamdCollection'
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-emerald-400 mb-4">🔧</h1>
          <h2 className="text-4xl font-bold text-white mb-4">We&apos;ll Be Back Soon!</h2>
          <p className="text-xl text-gray-300 max-w-md mx-auto">
            {general.maintenanceMessage}
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
          <p className="text-gray-300 mb-4">
            For urgent inquiries, please contact us at:
          </p>
          <div className="space-y-2 text-white">
            <p className="flex items-center justify-center gap-2">
              <span>📧</span>
              <a href={`mailto:${general.contactEmail}`} className="hover:text-emerald-400 transition-colors">
                {general.contactEmail}
              </a>
            </p>
            <p className="flex items-center justify-center gap-2">
              <span>📞</span>
              <a href={`tel:${general.phoneNumber}`} className="hover:text-emerald-400 transition-colors">
                {general.phoneNumber}
              </a>
            </p>
          </div>
        </div>
        
        <div className="mt-8">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} {general.siteName}
          </p>
        </div>
      </div>
    </div>
  );
}
