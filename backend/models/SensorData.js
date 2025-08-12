// models/SensorData.js - Updated Schema
const mongoose = require("mongoose");

const SensorDataSchema = new mongoose.Schema({
  timestamp: String,
  sensor1: Number,
  sensor2: Number,
  // Add new fields to handle both old and new data
  temperature: Number,    // For old data compatibility
  Temp: Number,          // For new data compatibility  
  humidity: Number,      // For old data compatibility
  Humidity: Number,      // For new data compatibility
  batteryLevel: Number,  // Optional field
}, {
  // This allows fields not in schema to be saved/retrieved
  strict: false
});

// ⚠️ Must match collection name exactly: sensorData (case-sensitive)
module.exports = mongoose.model("SensorData", SensorDataSchema, "sensorData");