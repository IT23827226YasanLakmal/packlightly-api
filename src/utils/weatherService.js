// utils/weatherService.js
require('dotenv').config();
const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

class WeatherService {
  // Get latitude and longitude for a location name
  static async getLocationCoordinates(locationName) {
    try {
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationName)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
      const response = await axios.get(url);

      if (response.data && response.data.length > 0) {
        const { lat, lon, name, country } = response.data[0];
        return { latitude: lat, longitude: lon, name, country };
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      console.error('Geocoding API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch location coordinates');
    }
  }

  // Get 5-day weather forecast filtered by trip dates
  static async getWeatherForecast(location, startDate, endDate) {
    try {
      const geocode = await this.getLocationCoordinates(location);
      const { latitude, longitude } = geocode;

      const forecastResponse = await axios.get(
        `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      const forecastList = forecastResponse.data.list || [];
      const filteredForecast = this.filterForecastForDates(forecastList, startDate, endDate);

      return this.formatWeatherData(filteredForecast, location);
    } catch (error) {
      console.error('Weather API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch weather data');
    }
  }

  // Filter forecast items by start and end dates
  static filterForecastForDates(forecastList, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return forecastList.filter(forecast => {
      const forecastDate = new Date(forecast.dt * 1000);
      return forecastDate >= start && forecastDate <= end;
    });
  }

  // Format forecast data safely
  static formatWeatherData(forecastData, location) {
    if (!forecastData || forecastData.length === 0) {
      return this.getDefaultWeatherData(location);
    }

    const temps = forecastData.map(f => f.main.temp);
    const highTemp = Math.max(...temps);
    const lowTemp = Math.min(...temps);

    const conditions = forecastData.map(f => f.weather[0].main.toLowerCase());
    const conditionCount = {};
    conditions.forEach(cond => {
      conditionCount[cond] = (conditionCount[cond] || 0) + 1;
    });
    const mostCommonCondition = Object.keys(conditionCount).reduce((a, b) =>
      conditionCount[a] > conditionCount[b] ? a : b
    );

    const conditionMap = {
      'clear': 'sunny',
      'clouds': 'cloudy',
      'rain': 'rainy',
      'drizzle': 'rainy',
      'thunderstorm': 'stormy',
      'snow': 'snowy',
      'mist': 'cloudy',
      'smoke': 'cloudy',
      'haze': 'cloudy',
      'dust': 'cloudy',
      'fog': 'cloudy',
      'sand': 'cloudy',
      'ash': 'cloudy',
      'squall': 'stormy',
      'tornado': 'stormy'
    };

    const firstForecast = forecastData[0];

    return {
      location,
      tempRange: `${Math.round(lowTemp)}°C - ${Math.round(highTemp)}°C`,
      description: firstForecast.weather[0].description,
      condition: conditionMap[mostCommonCondition] || 'sunny',
      highTemp: `${Math.round(highTemp)}°C`,
      lowTemp: `${Math.round(lowTemp)}°C`,
      wind: `${Math.round(firstForecast.wind.speed)} m/s`,
      humidity: `${firstForecast.main.humidity}%`,
      chanceRain: `${Math.round((firstForecast.pop || 0) * 100)}%`
    };
  }

  // Default weather object if no forecast available
  static getDefaultWeatherData(location) {
    return {
      location,
      tempRange: 'N/A - N/A',
      description: 'Weather data not available',
      condition: 'sunny',
      highTemp: 'N/A',
      lowTemp: 'N/A',
      wind: 'N/A',
      humidity: 'N/A',
      chanceRain: 'N/A'
    };
  }
}

module.exports = WeatherService;
