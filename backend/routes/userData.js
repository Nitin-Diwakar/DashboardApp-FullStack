// backend/routes/userData.js
const express = require("express");
const router = express.Router();
const UserData = require("../models/UserData");

// Get or create user data
router.post("/user-data", async (req, res) => {
  try {
    const { clerkUserId, email, firstName, lastName, userType, contactNumber } = req.body;

    if (!clerkUserId) {
      return res.status(400).json({ error: "Clerk User ID is required" });
    }

    // Try to find existing user
    let userData = await UserData.findOne({ clerkUserId });

    if (!userData) {
      // Create new user data entry
      userData = new UserData({
        clerkUserId,
        email,
        firstName,
        lastName,
        userType,
        contactNumber,
        workspace: {
          irrigationSettings: {
            selectedCropId: 'custom',
            moistureSettings: {
              sensor1: {
                irrigationThreshold: userType === 'farmer' ? 25 : 20,
                alertThreshold: userType === 'farmer' ? 35 : 30,
                optimalMin: 20,
                optimalMax: 80
              },
              sensor2: {
                irrigationThreshold: userType === 'farmer' ? 25 : 20,
                alertThreshold: userType === 'farmer' ? 35 : 30,
                optimalMin: 20,
                optimalMax: 80
              }
            },
            irrigationSettings: {
              duration: userType === 'farmer' ? 20 : 15,
              reIrrigationDelay: userType === 'farmer' ? 180 : 120,
              weatherIntegration: true,
              sensorPriority: 'sensor1'
            }
          },
          projects: [],
          activities: [],
          dashboardPreferences: {
            defaultView: userType === 'farmer' ? 'farming' : 'overview',
            favoriteCharts: [],
            notifications: {
              email: true,
              push: true,
              sms: userType === 'farmer' ? true : false
            }
          }
        }
      });

      await userData.save();
      console.log(`✅ Created new user data for: ${firstName} ${lastName} (${userType})`);
    } else {
      // Update existing user data if needed
      let updated = false;
      if (userData.email !== email) {
        userData.email = email;
        updated = true;
      }
      if (userData.firstName !== firstName) {
        userData.firstName = firstName;
        updated = true;
      }
      if (userData.lastName !== lastName) {
        userData.lastName = lastName;
        updated = true;
      }
      if (userData.userType !== userType) {
        userData.userType = userType;
        updated = true;
      }
      if (userData.contactNumber !== contactNumber) {
        userData.contactNumber = contactNumber;
        updated = true;
      }

      if (updated) {
        await userData.save();
        console.log(`✅ Updated user data for: ${firstName} ${lastName}`);
      }
    }

    res.json(userData);
  } catch (err) {
    console.error("Failed to get/create user data:", err);
    res.status(500).json({ error: "Failed to get/create user data" });
  }
});

// Get user data by Clerk ID
router.get("/user-data/:clerkUserId", async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const userData = await UserData.findOne({ clerkUserId });

    if (!userData) {
      return res.status(404).json({ error: "User data not found" });
    }

    res.json(userData);
  } catch (err) {
    console.error("Failed to fetch user data:", err);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// Update user workspace
router.put("/user-data/:clerkUserId/workspace", async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const { workspace } = req.body;

    const userData = await UserData.findOneAndUpdate(
      { clerkUserId },
      { $set: { workspace } },
      { new: true, runValidators: true }
    );

    if (!userData) {
      return res.status(404).json({ error: "User data not found" });
    }

    res.json(userData);
  } catch (err) {
    console.error("Failed to update user workspace:", err);
    res.status(500).json({ error: "Failed to update user workspace" });
  }
});

// Add user project
router.post("/user-data/:clerkUserId/projects", async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const { project } = req.body;

    const userData = await UserData.findOne({ clerkUserId });
    if (!userData) {
      return res.status(404).json({ error: "User data not found" });
    }

    userData.workspace.projects.push({
      ...project,
      id: new Date().getTime().toString(), // Simple ID generation
      createdAt: new Date()
    });

    await userData.save();
    res.json(userData);
  } catch (err) {
    console.error("Failed to add user project:", err);
    res.status(500).json({ error: "Failed to add user project" });
  }
});

// Add user activity
router.post("/user-data/:clerkUserId/activities", async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const { activity } = req.body;

    const userData = await UserData.findOne({ clerkUserId });
    if (!userData) {
      return res.status(404).json({ error: "User data not found" });
    }

    userData.workspace.activities.push({
      ...activity,
      id: new Date().getTime().toString(),
      createdAt: new Date()
    });

    await userData.save();
    res.json(userData);
  } catch (err) {
    console.error("Failed to add user activity:", err);
    res.status(500).json({ error: "Failed to add user activity" });
  }
});

// Delete user project
router.delete("/user-data/:clerkUserId/projects/:projectId", async (req, res) => {
  try {
    const { clerkUserId, projectId } = req.params;

    const userData = await UserData.findOneAndUpdate(
      { clerkUserId },
      { $pull: { "workspace.projects": { id: projectId } } },
      { new: true }
    );

    if (!userData) {
      return res.status(404).json({ error: "User data not found" });
    }

    res.json(userData);
  } catch (err) {
    console.error("Failed to delete user project:", err);
    res.status(500).json({ error: "Failed to delete user project" });
  }
});

module.exports = router;