const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // Load .env file

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB (local Compass)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection failed:", err));

// Routes
const sensorDataRoute = require("./routes/sensorData");
const auth0Route = require("./routes/auth0");
const updateUserMetadataRoute = require("./routes/updateUserMetadata");
const notificationRoute = require("./routes/notifications");

app.use("/api", sensorDataRoute); // Base route = /api/sensor-data
app.use("/api/auth", auth0Route); // Auth0 user management routes
app.use("/api", updateUserMetadataRoute); // User metadata update route
app.use("/api/notifications", notificationRoute); // WhatsApp notification routes

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
