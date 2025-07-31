const express = require("express");
const router = express.Router();  // ✅ This was missing
const SensorData = require("../models/SensorData");

router.get("/sensor-data", async (req, res) => {
  try {
    const data = await SensorData.find();
    console.log("Fetched sensorData count:", data.length);
    res.json(data);
  } catch (err) {
    console.error("Failed to fetch:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

module.exports = router;
