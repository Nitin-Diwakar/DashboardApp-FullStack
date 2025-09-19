const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');
const userService = require('../services/userService');

// Update user phone number and sync with notification system
router.post('/user/update-phone', async (req, res) => {
  try {
    const { userId, email, name, phone } = req.body;

    if (!userId || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'userId, email, and phone are required'
      });
    }

    // Add/update user in our system
    userService.addOrUpdateUser({
      userId,
      email,
      name: name || email,
      phone
    });

    console.log('📞 User phone updated:', { email, phone });

    res.json({
      success: true,
      message: 'Phone number updated successfully',
      user: userService.getUser(userId)
    });

  } catch (error) {
    console.error('❌ Error updating user phone:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send activity scheduled notification
router.post('/activity/scheduled', async (req, res) => {
  try {
    const { activityName, activityType, date, description, cropName, scheduledBy } = req.body;

    // Get all users with phone numbers
    const users = userService.getUsersWithPhones();
    
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'No users with phone numbers to notify',
        notifiedCount: 0
      });
    }

    // Send bulk notification
    const result = await whatsappService.sendBulkNotification(users, 'activity_scheduled', {
      activityName,
      activityType,
      date,
      description,
      cropName
    });

    console.log('📅 Activity scheduled notifications sent:', result.successCount);

    res.json({
      success: true,
      message: `Activity scheduled notification sent to ${result.successCount} users`,
      notifiedCount: result.successCount,
      totalUsers: result.totalCount,
      details: result.results
    });

  } catch (error) {
    console.error('❌ Error sending activity scheduled notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send activity completed notification
router.post('/activity/completed', async (req, res) => {
  try {
    const { activityName, completedBy, completedTime, cropName } = req.body;

    // Get all users with phone numbers
    const users = userService.getUsersWithPhones();
    
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'No users with phone numbers to notify',
        notifiedCount: 0
      });
    }

    // Send bulk notification
    const result = await whatsappService.sendBulkNotification(users, 'activity_completed', {
      activityName,
      completedTime: completedTime || new Date(),
      cropName
    });

    console.log('✅ Activity completed notifications sent:', result.successCount);

    res.json({
      success: true,
      message: `Activity completed notification sent to ${result.successCount} users`,
      notifiedCount: result.successCount,
      totalUsers: result.totalCount,
      details: result.results
    });

  } catch (error) {
    console.error('❌ Error sending activity completed notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send soil moisture alert
router.post('/soil/moisture-alert', async (req, res) => {
  try {
    const { alertType, moistureLevel, cropName, sensorName } = req.body;

    // Get all users with phone numbers
    const users = userService.getUsersWithPhones();
    
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'No users with phone numbers to notify',
        notifiedCount: 0
      });
    }

    // Send bulk notification
    const result = await whatsappService.sendBulkNotification(users, 'soil_moisture', {
      alertType,
      moistureLevel,
      cropName,
      sensorName
    });

    console.log('💧 Soil moisture alerts sent:', result.successCount);

    res.json({
      success: true,
      message: `Soil moisture alert sent to ${result.successCount} users`,
      notifiedCount: result.successCount,
      totalUsers: result.totalCount,
      details: result.results
    });

  } catch (error) {
    console.error('❌ Error sending soil moisture alert:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get notification stats
router.get('/stats', (req, res) => {
  try {
    const userStats = userService.getStats();
    const twilioConfigured = whatsappService.isConfigured;
    
    res.json({
      success: true,
      stats: {
        ...userStats,
        twilioConfigured,
        notificationStatus: twilioConfigured ? 'Active' : 'Not Configured'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all users (for debugging)
router.get('/users', (req, res) => {
  try {
    const users = userService.getAllUsers();
    res.json({
      success: true,
      users: users.map(user => ({
        ...user,
        phone: user.phone ? `${user.phone.slice(0, 2)}****${user.phone.slice(-2)}` : null // Mask phone numbers
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;