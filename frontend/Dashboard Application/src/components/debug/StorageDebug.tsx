import { useAuth0 } from '@auth0/auth0-react';
import { useAuth0Profile } from '@/hooks/useAuth0Profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, Database } from 'lucide-react';

export const StorageDebug = () => {
  const { user, isAuthenticated } = useAuth0();
  const { profile } = useAuth0Profile();

  const getLocalStorageData = () => {
    if (!user?.sub) return null;
    
    const keys = [
      `smart_irrigation_user_${user.sub.replace('|', '_')}`,
      `auth0_user_profile_${user.sub}`,
      'current_user_phone'
    ];
    
    const data: any = {};
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });
    
    return data;
  };

  const clearStoredData = () => {
    if (!user?.sub) return;
    
    const keys = [
      `smart_irrigation_user_${user.sub.replace('|', '_')}`,
      `auth0_user_profile_${user.sub}`,
      'current_user_phone',
      `phone_skipped_${user.sub}`
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
    window.location.reload();
  };

  if (!isAuthenticated) return null;

  const localData = getLocalStorageData();
  const hasLocalData = localData && Object.keys(localData).length > 0;

  return (
    <Card className="mt-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
          <Database className="h-5 w-5" />
          Phone Number Storage Debug
        </CardTitle>
        <CardDescription>
          Shows where your phone number is currently stored
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Profile State */}
        <div>
          <h4 className="font-medium mb-2">Current Profile State:</h4>
          <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
            <p><strong>Name:</strong> {profile?.name || 'N/A'}</p>
            <p><strong>Email:</strong> {profile?.email || 'N/A'}</p>
            <p><strong>Phone:</strong> {profile?.phone_number ? (
              <Badge variant="secondary">{profile.phone_number}</Badge>
            ) : (
              <Badge variant="outline">Not Set</Badge>
            )}</p>
            <p><strong>User ID:</strong> {profile?.id || 'N/A'}</p>
            {localData && Object.keys(localData).length > 0 && (
              <p><strong>Sync Status:</strong> {(() => {
                const userData = localData[`smart_irrigation_user_${user?.sub?.replace('|', '_')}`];
                if (userData?.auth0_synced) {
                  return <Badge variant="default" className="bg-green-500">Synced to Auth0</Badge>;
                } else if (userData?.storage_method?.includes('auth0')) {
                  return <Badge variant="secondary">Auth0 Attempted</Badge>;
                } else {
                  return <Badge variant="outline">LocalStorage Only</Badge>;
                }
              })()}</p>
            )}
          </div>
        </div>

        {/* LocalStorage Data */}
        <div>
          <h4 className="font-medium mb-2">LocalStorage Data:</h4>
          {hasLocalData ? (
            <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm space-y-2">
              {Object.entries(localData).map(([key, value]) => (
                <div key={key} className="border-b pb-2 last:border-b-0">
                  <p className="font-mono text-xs text-gray-600 dark:text-gray-400">{key}:</p>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No local data found</p>
          )}
        </div>

        {/* Auth0 User Object */}
        <div>
          <h4 className="font-medium mb-2">Auth0 User Object:</h4>
          <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify({
                sub: user?.sub,
                name: user?.name,
                email: user?.email,
                phone_number: user?.phone_number,
                user_metadata: user?.user_metadata
              }, null, 2)}
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => console.log('LocalStorage Data:', localData)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Log to Console
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={clearStoredData}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t">
          <p><strong>Storage Locations:</strong></p>
          <p>• <strong>LocalStorage:</strong> Browser local storage (current)</p>
          <p>• <strong>Auth0 Metadata:</strong> User metadata in Auth0 (future)</p>
          <p>• <strong>Backend Database:</strong> MongoDB + Auth0 sync (future)</p>
        </div>
      </CardContent>
    </Card>
  );
};