// backend/models/UserData.js
const mongoose = require("mongoose");

const UserDataSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['farmer', 'non-farmer'],
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  // User workspace/settings data
  workspace: {
    // Irrigation settings specific to this user
    irrigationSettings: {
      selectedCropId: { type: String, default: 'custom' },
      moistureSettings: {
        sensor1: {
          irrigationThreshold: { type: Number, default: 20 },
          alertThreshold: { type: Number, default: 30 },
          optimalMin: { type: Number, default: 20 },
          optimalMax: { type: Number, default: 80 }
        },
        sensor2: {
          irrigationThreshold: { type: Number, default: 20 },
          alertThreshold: { type: Number, default: 30 },
          optimalMin: { type: Number, default: 20 },
          optimalMax: { type: Number, default: 80 }
        }
      },
      irrigationSettings: {
        duration: { type: Number, default: 15 },
        reIrrigationDelay: { type: Number, default: 120 },
        weatherIntegration: { type: Boolean, default: true },
        sensorPriority: { type: String, default: 'sensor1' }
      }
    },
    // User's saved projects/tasks
    projects: [{
      id: String,
      name: String,
      description: String,
      createdAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' }
    }],
    // User's saved activities
    activities: [{
      id: String,
      title: String,
      description: String,
      scheduledDate: Date,
      completed: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }],
    // Dashboard preferences
    dashboardPreferences: {
      defaultView: { type: String, default: 'overview' },
      favoriteCharts: [String],
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
UserDataSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("UserData", UserDataSchema, "userData");