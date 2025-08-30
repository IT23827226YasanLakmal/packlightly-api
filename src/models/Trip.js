const mongoose = require('mongoose');
const WeatherService = require('../utils/weatherService');

const passengerSchema = new mongoose.Schema({
  adults: {
    type: Number,
    default: 0,
    min: 0,
  },
  children: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    default: 1,
    min: 1,
  }
}, { _id: false });

const TripSchema = new mongoose.Schema({
  ownerUid: String,
  title: String,
  type: {
    type: String,
    enum: ["Solo", "Couple", "Family", "Group"],
    required: true
  },

  destination: String,
  startDate: Date,
  endDate: Date,
  durationDays: Number,
  passengers: {
    type: passengerSchema,
    required: true
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  ecoSuggestions: {
    type: Boolean,
    default: false
  },
  weather: {
    location: String,
    tempRange: String,
    description: String,
    condition: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy'],
      default: 'sunny'
    },
    highTemp: String,
    lowTemp: String,
    wind: String,
    humidity: String,
    chanceRain: String
  }
}, { timestamps: true });

TripSchema.pre("save", async function (next) {
  // Passenger calculation (your existing code)
  if (this.type === "Solo") {
    this.passengers.adults = 1;
    this.passengers.children = 0;
    this.passengers.total = 1;
  } else if (this.type === "Couple") {
    this.passengers.adults = Math.max(this.passengers.adults, 2);
    this.passengers.total = this.passengers.adults + this.passengers.children;
  } else if (this.type === "Family") {
    this.passengers.total = this.passengers.adults + this.passengers.children;
  } else if (this.type === "Group") {
    if (!this.passengers.total || this.passengers.total < 1) {
      this.passengers.total = this.passengers.adults + this.passengers.children;
    }
  }

  // Fetch weather data if destination and dates are provided
  if (this.destination && this.startDate && this.endDate && !this.weather.location) {
    try {
      const weatherData = await WeatherService.getWeatherForecast(
        this.destination,
        this.startDate,
        this.endDate
      );
      this.weather = weatherData;
    } catch (error) {
      console.error('Failed to fetch weather data:', error.message);
      // Set default weather data
      this.weather = WeatherService.getDefaultWeatherData(this.destination);
    }
  }

  next();
});

// Add a method to refresh weather data
TripSchema.methods.refreshWeather = async function() {
  try {
    const weatherData = await WeatherService.getWeatherForecast(
      this.destination,
      this.startDate,
      this.endDate
    );
    this.weather = weatherData;
    await this.save();
    return weatherData;
  } catch (error) {
    throw new Error(`Failed to refresh weather: ${error.message}`);
  }
};

module.exports = mongoose.model('Trip', TripSchema);
