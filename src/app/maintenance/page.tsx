async function getMaintenanceData() {
  try {
    // Use the dedicated maintenance-status endpoint
    const response = await fetch('/api/maintenance-status', {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Error fetching maintenance data:', error);
  }
  return null;
}

export default async function MaintenancePage() {
  const data = await getMaintenanceData();
  
  const maintenanceData = data || {
    maintenanceMessage: 'We are currently performing maintenance. Please check back soon.',
    contactEmail: 'alhamdcollection518@gmail.com',
    phoneNumber: '+923171853183',
    siteName: '',
    
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900">
      <div className="text-center px-4">
        <div className="mb-8">
          {/* Website Logo */}
          <div className="mb-6">
            <img 
              src={maintenanceData.siteLogo} 
              alt={maintenanceData.siteName}
              className="h-24 w-auto mx-auto object-contain"
            />
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">Website Under Maintenance</h1>
          <p className="text-xl text-gray-300 max-w-md mx-auto">
            {maintenanceData.maintenanceMessage}
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
          <p className="text-gray-300 mb-4">
            For urgent inquiries, please contact us at:
          </p>
          <div className="space-y-3 text-white">
            <p className="flex items-center justify-center gap-2">
              <span>📧</span>
              <a href={`mailto:${maintenanceData.contactEmail}`} className="hover:text-emerald-400 transition-colors">
                {maintenanceData.contactEmail}
              </a>
            </p>
            <p className="flex items-center justify-center gap-2">
              <span>📞</span>
              <a href={`tel:${maintenanceData.phoneNumber}`} className="hover:text-emerald-400 transition-colors">
                {maintenanceData.phoneNumber}
              </a>
            </p>
          </div>
        </div>
        
        <div className="mt-8">
          <p className="text-gray-400 text-sm">
           ©{new Date().getFullYear()} {maintenanceData.siteName}AlhamdCollection. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
