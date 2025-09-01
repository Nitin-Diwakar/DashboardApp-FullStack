# Smart Irrigation Dashboard

## Table of Contents
1. [Dashboard Overview](#dashboard-overview)
2. [Field Health Overview](#field-health-overview)
3. [Smart Irrigation Recommendations](#smart-irrigation-recommendations)
4. [Weather Insights](#weather-insights)
5. [Soil Condition Analysis](#soil-condition-analysis)
6. [Sensor Cards](#sensor-cards)
7. [Irrigation Status Card](#irrigation-status-card)
8. [Data Sources & Algorithms](#data-sources--algorithms)
9. [Rule-Based Recommendation System](#rule-based-recommendation-system)

---

## Dashboard Overview

### Purpose
The Smart Irrigation Dashboard transforms raw sensor and weather data into actionable insights for farmers, focusing on **when to irrigate**, **how much water to use**, and **optimizing crop health** while **conserving water resources**.

### Core Value Propositions
- **Predictive Irrigation**: AI-driven recommendations prevent both under and over-watering
- **Weather Intelligence**: Integrates real-time weather to avoid unnecessary irrigation
- **Water Conservation**: Tracks efficiency and suggests optimization strategies
- **Crop Health Monitoring**: Provides holistic field health assessment
- **Mobile-First Design**: Accessible from the field on any device

---

## Field Health Overview

### Purpose
Provides farmers with a **single health score (0-100)** that summarizes overall field condition and actionable next steps.

### Data Sources Used
- **Soil Moisture**: Sensor 1 (15cm depth) + Sensor 2 (5cm root zone)
- **Weather Data**: Temperature, humidity, wind speed
- **User Settings**: Optimal moisture ranges, irrigation thresholds
- **Historical Trends**: Past 24-hour moisture patterns

### Overall Health Score Algorithm

```javascript
//remove health score for now
// Health Score Calculation (0-100) //
healthScore = (moistureScore × 0.6) + (temperatureScore × 0.25) + (humidityScore × 0.15)

// Moisture Score (60% weight - most critical)
if (avgMoisture >= optimalMin && avgMoisture <= optimalMax) {
    moistureScore = 100; // Perfect
} else if (avgMoisture < optimalMin) {
    moistureScore = Math.max(0, (avgMoisture / optimalMin) × 100);
} else {
    moistureScore = Math.max(60, 100 - ((avgMoisture - optimalMax) / 20) × 40);
}

// Temperature Score (25% weight)
if (temperature between 20-30°C) {
    temperatureScore = 100; // Optimal
} else {
    temperatureScore = Math.max(60, 100 - Math.abs(temperature - 25) × 4);
}

// Humidity Score (15% weight)
if (humidity between 50-70%) {
    humidityScore = 100; // Optimal
} else {
    humidityScore = Math.max(70, 100 - Math.abs(humidity - 60) × 2);
}
```

### Field Condition Rules & Outputs

| Health Score | Status | Color | Description | Actionable Advice |
|--------------|--------|-------|-------------|-------------------|
| 90-100 | Excellent | Green | Perfect growing conditions | Continue current care routine |
| 75-89 | Good | Blue | Minor optimization opportunities | Consider adjusting irrigation timing |
| 60-74 | Attention Needed | Yellow | Field needs monitoring | Monitor closely, adjust care if needed |
| 0-59 | Critical | Red | Immediate action required | Start irrigation immediately |

### Growth Prediction Algorithm

```javascript
// Growth Stage Prediction
if (healthScore >= 85) {
    prediction = { stage: "Optimal Growth", days: "7-10 days to next stage" };
} else if (healthScore >= 70) {
    prediction = { stage: "Steady Growth", days: "10-14 days to next stage" };
} else {
    prediction = { stage: "Slow Growth", days: "14+ days to next stage" };
}
```

---

## Smart Irrigation Recommendations

### Purpose
Provides **AI-driven irrigation decisions** with confidence levels and reasoning, eliminating guesswork for farmers.

### Data Sources Used
- **Real-time Soil Moisture**: Both sensors
- **Weather Forecast**: Rain predictions, temperature, humidity
- **System Settings**: Thresholds, duration, sensor priority
- **Historical Patterns**: Past irrigation effectiveness

### Recommendation Engine Algorithm

```javascript
// Primary Irrigation Decision Logic
function generateIrrigationRecommendation() {
    const avgMoisture = (sensor1 + sensor2) / 2;
    const avgThreshold = (threshold1 + threshold2) / 2;
    
    // Priority 1: Active Irrigation
    if (isIrrigationActive) {
        return {
            action: "Monitor soil response",
            confidence: 95,
            reasoning: "Moisture levels triggered automatic irrigation"
        };
    }
    
    // Priority 2: Weather Override
    if (precipitation > 0.5) {
        return {
            action: "Skip irrigation - Natural watering expected",
            confidence: 90,
            reasoning: "Weather forecast indicates sufficient natural watering"
        };
    }
    
    // Priority 3: Moisture-Based Decision
    if (avgMoisture < avgThreshold) {
        const urgency = avgMoisture < (avgThreshold - 10) ? "immediately" : "within 2 hours";
        return {
            action: `Begin irrigation ${urgency}`,
            confidence: 85,
            reasoning: "Moisture levels below irrigation threshold"
        };
    }
    
    // Priority 4: Continue Monitoring
    return {
        action: "Maintain current schedule",
        confidence: 80,
        reasoning: "Moisture levels within acceptable range"
    };
}
```

### Weather Adjustment Rules

| Condition | Adjustment | Reasoning |
|-----------|------------|-----------|
| Rain > 0.5mm | Skip irrigation for 24-48h | Natural watering available |
| Temperature > 35°C | Increase frequency by 20-30% | Higher evapotranspiration |
| Humidity < 40% + Wind > 15 km/h | Early morning irrigation | High evaporation conditions |
| Humidity > 80% | Reduce duration by 15-20% | Lower water loss |

### Water Efficiency Calculation

```javascript
// Efficiency Score (0-100)
const targetMoisture = (optimalMin + optimalMax) / 2;
const moistureDeviation = Math.abs(avgMoisture - targetMoisture);
const efficiency = Math.min(100, Math.max(0, 100 - moistureDeviation × 2));

// Water Savings Classification
if (efficiency > 80) return "High - Excellent water management";
if (efficiency > 60) return "Medium - Good efficiency, minor improvements possible";
return "Low - Optimization opportunities available";
```

---

## Weather Insights

### Purpose
Translates weather conditions into **irrigation impact analysis** and **48-hour action plans** for farmers.

### Data Sources Used
- **OpenWeather API**: Temperature, humidity, precipitation, wind speed
- **Real-time Sensor Data**: Current soil moisture levels
- **Location Data**: GPS coordinates for accurate local weather

### Weather Impact Rules

#### Rain Detection & Action
```javascript
// Rain Impact Algorithm
if (precipitation > 0.5) {
    recommendation = {
        action: "Skip irrigation for 24-48 hours",
        waterSavings: estimatedDailyUsage + "L saved",
        confidence: "High"
    };
}
```

#### Temperature Stress Analysis
```javascript
// Heat Stress Rules
if (temperature > 35) {
    return {
        alert: "Heat Stress Risk",
        impact: "Crops may stress, increase evaporation by 40%",
        action: "Increase irrigation frequency, water early morning/evening",
        priority: "High"
    };
} else if (temperature < 15) {
    return {
        alert: "Cool Weather",
        impact: "Reduced evaporation, slower growth",
        action: "Reduce irrigation frequency by 20%",
        priority: "Medium"
    };
}
```

#### Humidity & Wind Analysis
```javascript
// Evaporation Rate Calculation
if (humidity < 40 && windSpeed > 15) {
    evaporationRate = "High";
    recommendation = "Consider early morning irrigation (5-7 AM)";
} else if (humidity > 85) {
    evaporationRate = "Low";
    recommendation = "Reduce watering by 10-15%, monitor for fungal issues";
}
```

### 24-48 Hour Recommendations

| Weather Condition | Next 24h Action | Next 48h Action | Confidence |
|-------------------|-----------------|-----------------|------------|
| Rain Expected | Skip irrigation | Monitor soil moisture post-rain | High |
| Hot & Dry (>30°C, <50% humidity) | Increase irrigation by 20-30% | Continue early morning watering | Medium |
| Cool & Humid (<25°C, >70% humidity) | Reduce irrigation by 15% | Monitor for disease signs | Medium |
| Normal Conditions | Continue normal schedule | Maintain current routine | High |

---

## Soil Condition Analysis

### Purpose
Provides **advanced soil health analytics** including moisture trends, uniformity analysis, and irrigation timing predictions.

### Data Sources Used
- **Historical Sensor Data**: Last 24 hours of readings from both sensors
- **Moisture Trend Analysis**: 6-reading intervals for pattern detection
- **User Thresholds**: Irrigation and alert levels
- **Time-Series Analysis**: Rate of moisture change calculations

### Moisture Trend Algorithm

```javascript
// Trend Analysis (last 6 vs previous 6 readings)
function calculateTrends() {
    const recent = last6Readings.average();
    const older = previous6Readings.average();
    
    if (recent > older + 2) return "increasing";
    if (recent < older - 2) return "decreasing";
    return "stable";
}
```

### Soil Health Assessment Rules

```javascript
// Individual Sensor Health Scoring
function assessSensorHealth(moisture, sensorSettings) {
    if (moisture >= optimalMin && moisture <= optimalMax) {
        return { status: "Optimal", score: 100, color: "green" };
    } else if (moisture >= irrigationThreshold) {
        return { status: "Good", score: 80, color: "blue" };
    } else if (moisture >= alertThreshold) {
        return { status: "Dry", score: 60, color: "orange" };
    } else {
        return { status: "Critical", score: 30, color: "red" };
    }
}
```

### Time-to-Threshold Prediction

```javascript
// Predictive Algorithm for Irrigation Timing
function estimateTimeToThreshold() {
    const moistureDecreaseRate = calculateAverageDecreaseRate(); // %/hour
    const currentMoisture = getCurrentMoisture();
    const threshold = getIrrigationThreshold();
    
    if (moistureDecreaseRate > 0) {
        const hoursToThreshold = (currentMoisture - threshold) / moistureDecreaseRate;
        return Math.round(hoursToThreshold);
    }
    return null; // Moisture not decreasing
}
```

### Soil Uniformity Analysis

| Moisture Difference | Status | Description | Recommendation |
|-------------------|--------|-------------|----------------|
| ≤ 5% | Uniform | Even moisture distribution | Continue current irrigation pattern |
| 6-10% | Moderate Variation | Some variation detected | Monitor and consider adjusting zones |
| > 10% | High Variation | Significant difference | Check irrigation coverage and soil conditions |

---

## Sensor Cards

### Purpose
Displays **real-time sensor readings** with **visual status indicators** and **immediate actionable advice** for each sensor.

### Data Sources Used
- **Soil Moisture Sensors**: Real-time percentage readings
- **User Configuration**: Thresholds, optimal ranges, alert levels
- **Weather Data**: For impact assessment
- **Irrigation Status**: Priority and active state

### Sensor Status Rules

```javascript
// Status Classification Algorithm
function getSensorStatus(moistureValue, sensorSettings) {
    if (moistureValue < alertThreshold) {
        return {
            status: "Critical",
            message: "Immediate irrigation needed",
            actionable: "Start irrigation now",
            color: "red"
        };
    } else if (moistureValue < irrigationThreshold) {
        return {
            status: "Low", 
            message: "Below irrigation threshold",
            actionable: "Schedule irrigation soon",
            color: "orange"
        };
    } else if (moistureValue >= optimalMin && moistureValue <= optimalMax) {
        return {
            status: "Optimal",
            message: `Perfect range (${optimalMin}%-${optimalMax}%)`,
            actionable: "Continue monitoring",
            color: "green"
        };
    } else {
        return {
            status: "Good",
            message: "Above irrigation threshold", 
            actionable: "Monitor regularly",
            color: "blue"
        };
    }
}
```

### Weather Impact on Sensors

```javascript
// Weather-Based Recommendations
function getWeatherRecommendation(weatherData) {
    if (precipitation > 0.5) {
        return {
            message: "Rain expected - Skip irrigation",
            actionable: "Wait for natural watering"
        };
    } else if (temperature > 35) {
        return {
            message: "Extreme heat - Increase watering",
            actionable: "Water early morning/evening"
        };
    } else if (humidity > 80) {
        return {
            message: "High humidity - Reduce watering",
            actionable: "Monitor soil moisture closely"
        };
    }
    return {
        message: "Favorable conditions",
        actionable: "Continue normal schedule"
    };
}
```

---

## Irrigation Status Card

### Purpose
Provides **comprehensive irrigation system status**, **efficiency metrics**, and **predictive maintenance** information.

### Data Sources Used
- **System Configuration**: Duration, delays, sensor priorities
- **Real-time Status**: Active/inactive state
- **Weather Integration**: Impact on irrigation decisions
- **Historical Performance**: Efficiency calculations

### System Efficiency Algorithm

```javascript
// Irrigation System Efficiency (0-100%)
function calculateSystemEfficiency() {
    const avgMoisture = (sensor1 + sensor2) / 2;
    const avgOptimal = (sensor1Optimal + sensor2Optimal) / 2;
    const deviation = Math.abs(avgMoisture - avgOptimal);
    
    return Math.max(0, Math.min(100, 100 - deviation × 2));
}
```

### Water Usage Estimation

```javascript
// Daily Water Usage Calculation
function calculateWaterMetrics() {
    let adjustedDuration = baseDuration;
    
    // Weather-based adjustments
    if (precipitation > 0.5) adjustedDuration = 0; // Skip irrigation
    else if (temperature > 35) adjustedDuration *= 1.3; // Increase 30%
    else if (humidity > 80) adjustedDuration *= 0.8; // Reduce 20%
    
    const dailyUsage = adjustedDuration × 2.5; // Estimated L/min flow rate
    return { dailyUsage, weeklySavings: rainSavings };
}
```

### Next Irrigation Prediction Rules

| Current Condition | Predicted Time | Reasoning | Confidence |
|------------------|----------------|-----------|------------|
| Currently Active | X minutes remaining | System timer | High |
| Rain Expected | 24-48 hours | Weather delay | Medium |
| Below Threshold | Immediate | Moisture trigger | High |
| Approaching Threshold | 2-6 hours | Trend analysis | Medium |
| Normal Levels | 12-24 hours | Regular schedule | Medium |

---

## Data Sources & Algorithms

### Primary Data Sources

1. **MongoDB Sensor Database**
   - Historical moisture readings (sensor1, sensor2)
   - Temperature and humidity readings
   - Battery levels and device status
   - Timestamps for trend analysis

2. **OpenWeather API**
   - Current weather conditions
   - 48-hour precipitation forecast
   - Temperature, humidity, wind speed
   - Location-specific weather data

3. **User Configuration**
   - Irrigation thresholds per sensor
   - Alert levels and optimal ranges
   - System timing preferences
   - Crop-specific profiles

### Machine Learning Considerations

While the current system uses **rule-based algorithms**, it's designed to support future ML integration:

**Planned ML Enhancements:**
- **Predictive Irrigation**: Train models on historical irrigation effectiveness
- **Crop Growth Prediction**: Use sensor + weather data to predict growth stages
- **Anomaly Detection**: Identify unusual patterns in soil moisture
- **Optimization**: Learn optimal irrigation timing based on outcomes

**Current Rule-Based Benefits:**
- **Explainable**: Farmers understand why recommendations are made
- **Reliable**: Deterministic outputs based on proven agricultural practices
- **Fast**: Real-time responses without model inference delays
- **Customizable**: Easy to adjust rules based on local conditions

---

## Rule-Based Recommendation System

### Core Decision Tree

```
1. EMERGENCY CHECK
   └─ If moisture < alertThreshold
      └─ Output: "CRITICAL - Irrigate immediately"

2. WEATHER OVERRIDE  
   └─ If precipitation > 0.5mm
      └─ Output: "SKIP - Rain expected"

3. IRRIGATION LOGIC
   └─ If moisture < irrigationThreshold
      ├─ If difference > 10%: "Irrigate immediately"
      └─ Else: "Irrigate within 2 hours"

4. OPTIMIZATION
   └─ If moisture > optimal + 15%
      └─ Output: "Reduce next irrigation duration"

5. NORMAL MONITORING
   └─ Output: "Continue regular monitoring"
```

### Temperature Impact Rules

```javascript
// Heat Stress Rules
if (temperature > 40°C) {
    return "EXTREME HEAT WARNING - Multiple daily irrigations needed";
} else if (temperature > 35°C) {
    return "HIGH HEAT - Increase frequency by 30%, irrigate early morning";
} else if (temperature > 30°C) {
    return "WARM - Consider early morning irrigation";
} else if (temperature < 15°C) {
    return "COOL - Reduce irrigation frequency by 20%";
}
```

### Humidity & Evaporation Rules

```javascript
// Evaporation Rate Rules
const evaporationFactor = calculateEvaporation(temperature, humidity, windSpeed);

if (evaporationFactor > 8) {
    return "HIGH EVAPORATION - Increase irrigation by 25%, use mulching";
} else if (evaporationFactor > 6) {
    return "MODERATE EVAPORATION - Standard irrigation adequate";
} else if (evaporationFactor < 3) {
    return "LOW EVAPORATION - Reduce irrigation by 15%, monitor for fungal issues";
}
```

### System Confidence Levels

| Confidence | Conditions | Explanation |
|------------|------------|-------------|
| High (90-95%) | Weather data available, recent sensor readings | Strong data foundation |
| Medium (70-85%) | Some data missing, predictions based on trends | Reasonable accuracy expected |
| Low (50-70%) | Limited data, fallback algorithms used | User should verify manually |

---

## Summary

The Smart Irrigation Dashboard transforms complex agricultural data into simple, actionable insights through:

1. **Rule-Based Intelligence**: Proven agricultural practices encoded into algorithms
2. **Weather Integration**: Real-time weather data prevents unnecessary irrigation
3. **Predictive Analytics**: Trend analysis predicts optimal irrigation timing
4. **Efficiency Tracking**: Monitors water usage and suggests optimizations
5. **Mobile-First Design**: Accessible decision-making tools for field use

**Key Farmer Benefits:**
- Reduces water waste by 20-40%
- Prevents crop stress through predictive irrigation
- Saves time with automated monitoring
- Increases yields through optimal moisture management
- Provides peace of mind with intelligent alerts

