// utils/weatherService.js
const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

class WeatherService {
  static async getWeatherForecast(location, startDate, endDate) {
    try {
      // First, get coordinates for the location
      const geocodeResponse = await axios.get(
        `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${OPENWEATHER_API_KEY}`
      );

      if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
        throw new Error('Location not found');
      }

      const { lat, lon } = geocodeResponse.data[0];
      
      // Get 5-day weather forecast (OpenWeather provides 5 days with 3-hour intervals)
      const forecastResponse = await axios.get(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      // Filter forecast for your trip dates
      const filteredForecast = this.filterForecastForDates(
        forecastResponse.data.list,
        startDate,
        endDate
      );

      return this.formatWeatherData(filteredForecast, location);
    } catch (error) {
      console.error('Weather API error:', error.message);
      throw new Error('Failed to fetch weather data');
    }
  }

  static filterForecastForDates(forecastList, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return forecastList.filter(forecast => {
      const forecastDate = new Date(forecast.dt * 1000);
      return forecastDate >= start && forecastDate <= end;
    });
  }

  static formatWeatherData(forecastData, location) {
    if (!forecastData || forecastData.length === 0) {
      return this.getDefaultWeatherData(location);
    }

    // Calculate averages and extremes
    const temps = forecastData.map(f => f.main.temp);
    const highTemp = Math.max(...temps);
    const lowTemp = Math.min(...temps);
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

    // Get most common condition
    const conditions = forecastData.map(f => f.weather[0].main.toLowerCase());
    const conditionCount = {};
    conditions.forEach(cond => {
      conditionCount[cond] = (conditionCount[cond] || 0) + 1;
    });
    const mostCommonCondition = Object.keys(conditionCount).reduce((a, b) => 
      conditionCount[a] > conditionCount[b] ? a : b
    );

    // Map OpenWeather conditions to your schema
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

    return {
      location,
      tempRange: `${Math.round(lowTemp)}°C - ${Math.round(highTemp)}°C`,
      description: forecastData[0].weather[0].description,
      condition: conditionMap[mostCommonCondition] || 'sunny',
      highTemp: `${Math.round(highTemp)}°C`,
      lowTemp: `${Math.round(lowTemp)}°C`,
      wind: `${Math.round(forecastData[0].wind.speed)} m/s`,
      humidity: `${forecastData[0].main.humidity}%`,
      chanceRain: `${Math.round(this.calculateRainChance(forecastData))}%`
    };
  }

  static calculateRainChance(forecastData) {
    const rainyForecasts = forecastData.filter(f => 
      f.weather[0].main.toLowerCase().includes('rain') || 
      f.weather[0].main.toLowerCase().includes('drizzle')
    );
    return (rainyForecasts.length / forecastData.length) * 100;
  }

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