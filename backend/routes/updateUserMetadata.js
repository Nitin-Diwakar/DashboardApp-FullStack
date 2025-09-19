const express = require('express');
const router = express.Router();

// Simple Auth0 Management API client
const { ManagementClient } = require('auth0');

// Initialize Auth0 Management client
let management;

const initializeAuth0 = () => {
  if (!management && process.env.AUTH0_DOMAIN && process.env.AUTH0_CLIENT_SECRET) {
    management = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      scope: 'update:users'
    });
    console.log('✅ Auth0 Management API initialized');
  }
};

// Initialize on startup
initializeAuth0();

// Update user metadata endpoint
router.post('/update-user-metadata', async (req, res) => {
  try {
    const { userId, phone_number, auth0_domain } = req.body;

    console.log('📞 Updating user metadata for:', userId);
    console.log('📱 Phone number:', phone_number);

    // Validate input
    if (!userId || !phone_number) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId and phone_number are required' 
      });
    }

    // Check if Auth0 is configured
    if (!management) {
      console.log('⚠️ Auth0 Management API not configured, skipping sync');
      return res.status(200).json({ 
        success: true, 
        message: 'Auth0 not configured, stored locally only',
        stored_in: 'localStorage_only'
      });
    }

    // Update user metadata in Auth0
    const updatedUser = await management.updateUser(
      { id: userId },
      {
        user_metadata: {
          phone_number: phone_number,
          phone_updated_at: new Date().toISOString(),
          updated_via: 'smart_irrigation_app'
        }
      }
    );

    console.log('✅ Successfully updated Auth0 user metadata');

    res.json({
      success: true,
      message: 'Phone number saved to Auth0 user metadata',
      stored_in: 'auth0_metadata',
      updated_at: updatedUser.updated_at
    });

  } catch (error) {
    console.error('❌ Error updating Auth0 user metadata:', error.message);
    
    // Return success anyway since we have localStorage fallback
    res.json({
      success: true,
      message: 'Saved locally (Auth0 sync failed)',
      stored_in: 'localStorage_fallback',
      error: error.message
    });
  }
});

module.exports = router;