const mongoose = require("mongoose");

const SensorDataSchema = new mongoose.Schema({
  timestamp: String,
  sensor1: Number,
  sensor2: Number,
});

// ⚠️ Must match collection name exactly: sensorData (case-sensitive)
module.exports = mongoose.model("SensorData", SensorDataSchema, "sensorData");
