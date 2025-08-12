// routes/sensorData.js - Updated with Data Normalization
const express = require("express");
const router = express.Router();
const SensorData = require("../models/SensorData");

router.get("/sensor-data", async (req, res) => {
  try {
    const rawData = await SensorData.find().sort({ timestamp: 1 }); // Sort by timestamp
    
    // Normalize data to consistent field names
    const normalizedData = rawData.map(item => {
      const normalized = {
        timestamp: item.timestamp,
        sensor1: item.sensor1,
        sensor2: item.sensor2,
        // Normalize temperature field (handle both 'temperature' and 'Temp')
        temperature: item.temperature || item.Temp || null,
        // Normalize humidity field (handle both 'humidity' and 'Humidity')  
        humidity: item.humidity || item.Humidity || null,
        // Battery level (only if exists, don't generate fake data)
        batteryLevel: item.batteryLevel || null
      };
      
      return normalized;
    });
    
    console.log(`Fetched ${normalizedData.length} sensor records`);
    res.json(normalizedData);
  } catch (err) {
    console.error("Failed to fetch sensor data:", err);
    res.status(500).json({ error: "Failed to fetch sensor data" });
  }
});

module.exports = router;