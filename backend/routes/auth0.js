const express = require('express');
const { ManagementClient } = require('auth0');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const router = express.Router();

// Auth0 Management API client
const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: 'update:users read:users'
});

// JWKS client for token verification
const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

// Helper function to get signing key
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Middleware to verify Auth0 token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, getKey, {
    audience: process.env.AUTH0_AUDIENCE || 'https://smart-irrigation.example.com/api',
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
  }, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

// Update user metadata (phone number)
router.patch('/users/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { phone_number } = req.body;

    // Verify user is updating their own profile
    if (req.user.sub !== userId) {
      return res.status(403).json({ error: 'Forbidden: Can only update own profile' });
    }

    // Validate phone number
    if (!phone_number || typeof phone_number !== 'string') {
      return res.status(400).json({ error: 'Valid phone number is required' });
    }

    // Update user metadata in Auth0
    const updatedUser = await management.updateUser(
      { id: userId },
      {
        user_metadata: {
          phone_number: phone_number,
          phone_updated_at: new Date().toISOString()
        }
      }
    );

    res.json({
      success: true,
      phone_number: phone_number,
      updated_at: updatedUser.updated_at
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      error: 'Failed to update user profile',
      details: error.message 
    });
  }
});

// Get user profile
router.get('/users/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is accessing their own profile
    if (req.user.sub !== userId) {
      return res.status(403).json({ error: 'Forbidden: Can only access own profile' });
    }

    const user = await management.getUser({ id: userId });
    
    res.json({
      id: user.user_id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      phone_number: user.user_metadata?.phone_number,
      email_verified: user.email_verified,
      created_at: user.created_at,
      updated_at: user.updated_at
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user profile',
      details: error.message 
    });
  }
});

module.exports = router;