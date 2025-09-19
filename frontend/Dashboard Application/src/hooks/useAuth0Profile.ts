import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { updateNotificationPhone } from '@/lib/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  picture?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useAuth0Profile = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Transform Auth0 user to our profile format
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('👤 Loading user profile for:', user.email);
      
      // Load stored profile data from localStorage using new key format
      const userProfileKey = `smart_irrigation_user_${user.sub.replace('|', '_')}`;
      const storedProfile = localStorage.getItem(userProfileKey);
      const storedData = storedProfile ? JSON.parse(storedProfile) : {};
      
      console.log('💾 Stored profile data:', storedData);
      
      const transformedProfile: UserProfile = {
        id: user.sub || '',
        name: user.name || user.nickname || 'User',
        email: user.email || '',
        phone_number: storedData.phone_number || user.phone_number || user.user_metadata?.phone_number,
        picture: user.picture,
        email_verified: user.email_verified,
        phone_verified: storedData.phone_verified || user.phone_verified || user.user_metadata?.phone_verified,
        created_at: user.created_at,
        updated_at: storedData.updated_at || user.updated_at,
      };
      
      console.log('✅ Final profile:', transformedProfile);
      setProfile(transformedProfile);
    } else {
      setProfile(null);
    }
  }, [user, isAuthenticated]);

  // Update user phone number
  const updatePhoneNumber = async (phoneNumber: string): Promise<boolean> => {
    console.log('📱 Updating phone number:', phoneNumber);
    console.log('🔐 User authenticated:', isAuthenticated, 'User ID:', user?.sub);
    
    if (!isAuthenticated || !user?.sub) {
      console.error('❌ User not authenticated');
      throw new Error('User not authenticated');
    }

    setIsUpdating(true);
    
    try {
      // 1. Store in localStorage first (immediate)
      const userProfileKey = `smart_irrigation_user_${user.sub.replace('|', '_')}`;
      
      const userProfile = {
        phone_number: phoneNumber,
        phone_verified: false,
        updated_at: new Date().toISOString(),
        user_id: user.sub,
        email: user.email,
        name: user.name,
        storage_method: 'localStorage_with_auth0_attempt'
      };
      
      // Save to localStorage immediately
      localStorage.setItem(userProfileKey, JSON.stringify(userProfile));
      localStorage.setItem('current_user_phone', phoneNumber);
      console.log('💾 Phone number saved to localStorage:', userProfileKey);
      
      // Update local profile state immediately
      setProfile(prev => prev ? {
        ...prev,
        phone_number: phoneNumber,
        phone_verified: false
      } : null);
      
      // 1b. Sync to notifications service (Twilio user list)
      try {
        await updateNotificationPhone({
          userId: user.sub,
          email: user.email || '',
          name: user.name || undefined,
          phone: phoneNumber,
        });
        console.log('✅ Synced phone to notifications service');
      } catch (e) {
        console.log('⚠️ Failed to sync to notifications service:', e);
      }
      
      // 2. Try to save to Auth0 user metadata (via Management API)
      try {
        console.log('🔄 Attempting to save to Auth0 user metadata...');
        
        // Create a simple API call to our backend that will update Auth0
        const response = await fetch('http://localhost:5000/api/update-user-metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.sub,
            phone_number: phoneNumber,
            auth0_domain: import.meta.env.VITE_AUTH0_DOMAIN,
          }),
        });
        
        if (response.ok) {
          console.log('✅ Successfully saved to Auth0 metadata!');
          
          // Update storage method in localStorage
          userProfile.storage_method = 'localStorage_and_auth0';
          userProfile.auth0_synced = true;
          localStorage.setItem(userProfileKey, JSON.stringify(userProfile));
        } else {
          console.log('⚠️ Auth0 sync failed, using localStorage only');
        }
        
      } catch (auth0Error) {
        console.log('⚠️ Auth0 sync not available, using localStorage only:', auth0Error);
      }
      
      console.log('✅ Phone number update successful (stored locally)');
      return true;
      
    } catch (error) {
      console.error('❌ Error updating phone number:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if user needs to provide phone number
  const needsPhoneNumber = () => {
    if (!isAuthenticated || !profile) return false;
    
    // Check if user has a phone number
    if (profile.phone_number) return false;
    
    // Check if user has skipped phone number collection
    const hasSkipped = localStorage.getItem(`phone_skipped_${profile.id}`) === 'true';
    if (hasSkipped) return false;
    
    return true;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!profile?.name) return 'U';
    return profile.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return {
    profile,
    isLoading,
    isUpdating,
    updatePhoneNumber,
    needsPhoneNumber,
    getUserInitials,
    isAuthenticated,
  };
};