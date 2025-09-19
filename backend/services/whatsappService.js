const twilio = require('twilio');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM; // e.g., 'whatsapp:+14155238886'
    this.isConfigured = false;
    this.defaultTemplateSid = process.env.TWILIO_WHATSAPP_TEMPLATE_SID || null; // Optional Content Template SID
    this.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID || null; // Optional Messaging Service SID
    
    this.initializeTwilio();
  }

  initializeTwilio() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (accountSid && authToken && this.fromWhatsApp) {
      this.client = twilio(accountSid, authToken);
      this.isConfigured = true;
      console.log('✅ Twilio WhatsApp service initialized');
    } else {
      console.log('⚠️ Twilio WhatsApp not configured - missing credentials');
      console.log('Required env variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM');
    }
  }

  // Optional: send WhatsApp Template via Twilio Content API (requires approved template and Content SID)
  async sendTemplateMessage({ to, contentSid, variables }) {
    if (!this.isConfigured) return { success: false, error: 'WhatsApp not configured' };
    const formattedPhone = this.formatWhatsAppNumber(to);
    try {
      const base = {
        to: formattedPhone,
        contentSid: contentSid,
        contentVariables: variables ? JSON.stringify(variables) : undefined,
      };
      const params = this.messagingServiceSid
        ? { ...base, messagingServiceSid: this.messagingServiceSid }
        : { ...base, from: this.fromWhatsApp };
      const result = await this.client.messages.create(params);
      return { success: true, messageSid: result.sid };
    } catch (e) {
      return { success: false, error: e.message, twilioCode: e.code };
    }
  }

  // Format phone number for WhatsApp (ensure it starts with whatsapp:)
  formatWhatsAppNumber(phoneNumber) {
    // Remove all non-digits
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if missing (assuming India +91)
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    
    // Format for WhatsApp
    return `whatsapp:+${cleaned}`;
  }

  // Send activity scheduled notification
  async sendActivityScheduled({ userPhone, userName, activityName, activityType, date, description, cropName }) {
    if (!this.isConfigured) {
      console.log('📱 Twilio not configured - would send:', { userPhone, activityName });
      return { success: false, message: 'WhatsApp service not configured' };
    }

    const formattedPhone = this.formatWhatsAppNumber(userPhone);
    const formattedDate = new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const message = `🌾 *Smart Irrigation Alert*

📅 *Activity Scheduled*
👤 Farmer: ${userName}
🔧 Activity: ${activityName}
📋 Type: ${activityType}
🗓️ Date: ${formattedDate}
🌱 Crop: ${cropName || 'Not specified'}

📝 Description: ${description || 'No additional details'}

Stay updated with your farm activities! 🚜`;

    try {
      const result = await this.client.messages.create({
        from: this.fromWhatsApp,
        to: formattedPhone,
        body: message
      });

      console.log('✅ Activity scheduled notification sent:', result.sid);
      return { success: true, messageSid: result.sid };
    } catch (error) {
      if (error?.code === 63016) {
        // Try optional template if configured
        if (this.defaultTemplateSid) {
          const t = await this.sendTemplateMessage({
            to: userPhone,
            contentSid: this.defaultTemplateSid,
            variables: {
              name: userName || 'Farmer',
              activity: activityName,
              date: formattedDate,
            },
          });
          if (t.success) return t;
        }
        console.warn('⚠️ WhatsApp session window closed. User must message sandbox or use template.');
        return {
          success: false,
          error: 'WHATSAPP_FREEFORM_WINDOW_CLOSED',
          details: 'User must send a message to your WhatsApp number to reopen the 24-hour window, or you must send a pre-approved template.',
          twilioCode: 63016,
        };
      }
      console.error('❌ Failed to send activity notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send activity completed notification
  async sendActivityCompleted({ userPhone, userName, activityName, completedTime, cropName }) {
    if (!this.isConfigured) {
      console.log('📱 Twilio not configured - would send activity completed:', { userPhone, activityName });
      return { success: false, message: 'WhatsApp service not configured' };
    }

    const formattedPhone = this.formatWhatsAppNumber(userPhone);
    const formattedTime = new Date(completedTime).toLocaleString('en-IN', {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    });

    const message = `🌾 *Smart Irrigation Update*

✅ *Activity Completed*
👤 Farmer: ${userName}
🔧 Activity: ${activityName}
⏰ Completed: ${formattedTime}
🌱 Crop: ${cropName || 'Not specified'}

Great work! Your farm activity has been successfully completed! 🎉🚜`;

    try {
      const result = await this.client.messages.create({
        from: this.fromWhatsApp,
        to: formattedPhone,
        body: message
      });

      console.log('✅ Activity completed notification sent:', result.sid);
      return { success: true, messageSid: result.sid };
    } catch (error) {
      if (error?.code === 63016) {
        // Try optional template if configured
        if (this.defaultTemplateSid) {
          const t = await this.sendTemplateMessage({
            to: userPhone,
            contentSid: this.defaultTemplateSid,
            variables: {
              name: userName || 'Farmer',
              activity: activityName,
              date: formattedTime,
            },
          });
          if (t.success) return t;
        }
        console.warn('⚠️ WhatsApp session window closed. User must message sandbox or use template.');
        return {
          success: false,
          error: 'WHATSAPP_FREEFORM_WINDOW_CLOSED',
          details: 'User must send a message to your WhatsApp number to reopen the 24-hour window, or you must send a pre-approved template.',
          twilioCode: 63016,
        };
      }
      console.error('❌ Failed to send completion notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send soil moisture alert
  async sendSoilMoistureAlert({ userPhone, userName, alertType, moistureLevel, cropName, sensorName }) {
    if (!this.isConfigured) {
      console.log('📱 Twilio not configured - would send moisture alert:', { userPhone, alertType, moistureLevel });
      return { success: false, message: 'WhatsApp service not configured' };
    }

    const formattedPhone = this.formatWhatsAppNumber(userPhone);
    
    let alertEmoji, alertTitle, alertMessage;
    
    switch (alertType) {
      case 'critical':
        alertEmoji = '🚨';
        alertTitle = 'CRITICAL MOISTURE ALERT';
        alertMessage = `Your soil moisture is critically low at ${moistureLevel}%! Immediate irrigation required.`;
        break;
      case 'low':
        alertEmoji = '⚠️';
        alertTitle = 'LOW MOISTURE ALERT';
        alertMessage = `Soil moisture is low at ${moistureLevel}%. Consider irrigation soon.`;
        break;
      case 'irrigation_started':
        alertEmoji = '💧';
        alertTitle = 'IRRIGATION STARTED';
        alertMessage = `Automatic irrigation has started. Current moisture: ${moistureLevel}%`;
        break;
      default:
        alertEmoji = '📊';
        alertTitle = 'MOISTURE UPDATE';
        alertMessage = `Current soil moisture: ${moistureLevel}%`;
    }

    const message = `🌾 *Smart Irrigation System*

${alertEmoji} *${alertTitle}*
👤 Farmer: ${userName}
🌱 Crop: ${cropName || 'Not specified'}
📡 Sensor: ${sensorName || 'Main Sensor'}
💧 Moisture Level: ${moistureLevel}%

${alertMessage}

Monitor your crops with Smart Irrigation! 📱🚜`;

    try {
      const result = await this.client.messages.create({
        from: this.fromWhatsApp,
        to: formattedPhone,
        body: message
      });

      console.log('✅ Soil moisture alert sent:', result.sid);
      return { success: true, messageSid: result.sid };
    } catch (error) {
      if (error?.code === 63016) {
        // Try optional template if configured
        if (this.defaultTemplateSid) {
          const t = await this.sendTemplateMessage({
            to: userPhone,
            contentSid: this.defaultTemplateSid,
            variables: {
              name: userName || 'Farmer',
              alert: alertTitle,
              level: `${moistureLevel}%`,
            },
          });
          if (t.success) return t;
        }
        console.warn('⚠️ WhatsApp session window closed. User must message sandbox or use template.');
        return {
          success: false,
          error: 'WHATSAPP_FREEFORM_WINDOW_CLOSED',
          details: 'User must send a message to your WhatsApp number to reopen the 24-hour window, or you must send a pre-approved template.',
          twilioCode: 63016,
        };
      }
      console.error('❌ Failed to send moisture alert:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send bulk notifications to all users
  async sendBulkNotification(users, notificationType, data) {
    if (!this.isConfigured) {
      console.log('📱 Twilio not configured - would send bulk notification to', users.length, 'users');
      return { success: false, message: 'WhatsApp service not configured' };
    }

    const results = [];
    
    for (const user of users) {
      try {
        let result;
        
        switch (notificationType) {
          case 'activity_scheduled':
            result = await this.sendActivityScheduled({ ...data, userPhone: user.phone, userName: user.name });
            break;
          case 'activity_completed':
            result = await this.sendActivityCompleted({ ...data, userPhone: user.phone, userName: user.name });
            break;
          case 'soil_moisture':
            result = await this.sendSoilMoistureAlert({ ...data, userPhone: user.phone, userName: user.name });
            break;
        }
        
        results.push({
          user: user.email,
          phone: user.phone,
          success: result.success,
          messageSid: result.messageSid,
          error: result.error,
          details: result.details,
          twilioCode: result.twilioCode,
        });
        
        // Add delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        results.push({
          user: user.email,
          phone: user.phone,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`📊 Bulk notification sent to ${successCount}/${users.length} users`);
    
    return { success: true, results, successCount, totalCount: users.length };
  }
}

module.exports = new WhatsAppService();