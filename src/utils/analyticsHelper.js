/**
 * Analytics utility functions for report generation
 */

class AnalyticsHelper {
  
  /**
   * Calculate percentage with proper rounding
   * @param {number} part - The part value
   * @param {number} total - The total value
   * @param {number} decimals - Number of decimal places (default: 2)
   * @returns {number} Percentage value
   */
  static calculatePercentage(part, total, decimals = 2) {
    if (total === 0) return 0;
    return Math.round((part / total) * 100 * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Calculate average with proper rounding
   * @param {number[]} values - Array of numbers
   * @param {number} decimals - Number of decimal places (default: 2)
   * @returns {number} Average value
   */
  static calculateAverage(values, decimals = 2) {
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + (val || 0), 0);
    return Math.round((sum / values.length) * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Group data by a specific field
   * @param {Array} data - Array of objects
   * @param {string} field - Field to group by
   * @returns {Object} Grouped data
   */
  static groupBy(data, field) {
    return data.reduce((groups, item) => {
      const key = item[field] || 'Unknown';
      groups[key] = groups[key] || [];
      groups[key].push(item);
      return groups;
    }, {});
  }

  /**
   * Count occurrences of values in an array
   * @param {Array} data - Array of values
   * @returns {Object} Count of each value
   */
  static countOccurrences(data) {
    return data.reduce((counts, item) => {
      counts[item] = (counts[item] || 0) + 1;
      return counts;
    }, {});
  }

  /**
   * Filter data by date range
   * @param {Array} data - Array of objects with date fields
   * @param {string} dateField - Name of the date field
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {Array} Filtered data
   */
  static filterByDateRange(data, dateField, startDate, endDate) {
    if (!startDate && !endDate) return data;

    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      
      if (startDate && itemDate < new Date(startDate)) return false;
      if (endDate && itemDate > new Date(endDate)) return false;
      
      return true;
    });
  }

  /**
   * Generate month-year keys for time series data
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {string[]} Array of month-year strings
   */
  static generateMonthRange(startDate, endDate) {
    const months = [];
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    for (let current = new Date(start); current <= end; current.setMonth(current.getMonth() + 1)) {
      months.push(current.toISOString().slice(0, 7)); // YYYY-MM format
    }

    return months;
  }

  /**
   * Group data by month for time series analysis
   * @param {Array} data - Array of objects with date fields
   * @param {string} dateField - Name of the date field
   * @param {string} valueField - Name of the value field to aggregate
   * @param {string} aggregationType - Type of aggregation ('count', 'sum', 'avg')
   * @returns {Object} Monthly aggregated data
   */
  static groupByMonth(data, dateField, valueField = null, aggregationType = 'count') {
    const monthlyData = {};

    data.forEach(item => {
      const date = new Date(item[dateField]);
      if (isNaN(date.getTime())) return; // Skip invalid dates

      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, sum: 0, values: [] };
      }

      monthlyData[monthKey].count++;
      
      if (valueField && item[valueField] !== undefined) {
        const value = Number(item[valueField]) || 0;
        monthlyData[monthKey].sum += value;
        monthlyData[monthKey].values.push(value);
      }
    });

    // Convert to final format based on aggregation type
    const result = {};
    Object.keys(monthlyData).forEach(month => {
      const data = monthlyData[month];
      
      switch (aggregationType) {
        case 'count':
          result[month] = data.count;
          break;
        case 'sum':
          result[month] = data.sum;
          break;
        case 'avg':
          result[month] = data.values.length > 0 ? 
            this.calculateAverage(data.values) : 0;
          break;
        default:
          result[month] = data.count;
      }
    });

    return result;
  }

  /**
   * Calculate trend direction and percentage change
   * @param {number[]} values - Array of numeric values in chronological order
   * @returns {Object} Trend analysis
   */
  static calculateTrend(values) {
    if (values.length < 2) {
      return { direction: 'stable', change: 0, trend: 'insufficient-data' };
    }

    const firstValue = values[0] || 0;
    const lastValue = values[values.length - 1] || 0;
    
    if (firstValue === 0) {
      return { 
        direction: lastValue > 0 ? 'up' : 'stable', 
        change: lastValue, 
        trend: 'new-data' 
      };
    }

    const changePercentage = ((lastValue - firstValue) / firstValue) * 100;
    
    let direction = 'stable';
    if (changePercentage > 5) direction = 'up';
    else if (changePercentage < -5) direction = 'down';

    return {
      direction,
      change: Math.round(changePercentage * 100) / 100,
      trend: direction === 'stable' ? 'stable' : direction === 'up' ? 'increasing' : 'decreasing'
    };
  }

  /**
   * Get top N items from a data object
   * @param {Object} data - Object with key-value pairs
   * @param {number} limit - Number of top items to return
   * @param {string} sortBy - Sort by 'value' or 'key'
   * @returns {Array} Array of {key, value} objects
   */
  static getTopItems(data, limit = 10, sortBy = 'value') {
    const entries = Object.entries(data);
    
    const sorted = entries.sort((a, b) => {
      if (sortBy === 'value') {
        return b[1] - a[1]; // Sort by value descending
      } else {
        return a[0].localeCompare(b[0]); // Sort by key alphabetically
      }
    });

    return sorted.slice(0, limit).map(([key, value]) => ({ key, value }));
  }

  /**
   * Calculate statistical measures for an array of numbers
   * @param {number[]} values - Array of numbers
   * @returns {Object} Statistical measures
   */
  static calculateStats(values) {
    if (!values || values.length === 0) {
      return {
        count: 0,
        sum: 0,
        average: 0,
        min: 0,
        max: 0,
        median: 0,
        standardDeviation: 0
      };
    }

    const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    const count = validValues.length;
    
    if (count === 0) {
      return {
        count: 0,
        sum: 0,
        average: 0,
        min: 0,
        max: 0,
        median: 0,
        standardDeviation: 0
      };
    }

    const sum = validValues.reduce((acc, val) => acc + val, 0);
    const average = sum / count;
    const min = Math.min(...validValues);
    const max = Math.max(...validValues);

    // Calculate median
    const sorted = [...validValues].sort((a, b) => a - b);
    const median = count % 2 === 0 
      ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
      : sorted[Math.floor(count / 2)];

    // Calculate standard deviation
    const variance = validValues.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / count;
    const standardDeviation = Math.sqrt(variance);

    return {
      count,
      sum: Math.round(sum * 100) / 100,
      average: Math.round(average * 100) / 100,
      min,
      max,
      median: Math.round(median * 100) / 100,
      standardDeviation: Math.round(standardDeviation * 100) / 100
    };
  }

  /**
   * Format large numbers with appropriate units
   * @param {number} num - The number to format
   * @returns {string} Formatted number string
   */
  static formatLargeNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  }

  /**
   * Create color palette for charts
   * @param {number} count - Number of colors needed
   * @returns {string[]} Array of hex color codes
   */
  static generateColorPalette(count) {
    const baseColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
      '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
    ];

    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    // Generate additional colors if needed
    const colors = [...baseColors];
    for (let i = baseColors.length; i < count; i++) {
      const hue = (i * 137.508) % 360; // Golden angle approximation
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }

    return colors;
  }

  /**
   * Validate date range
   * @param {string|Date} startDate - Start date
   * @param {string|Date} endDate - End date
   * @returns {Object} Validation result
   */
  static validateDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      return { valid: false, message: 'Invalid start date' };
    }

    if (isNaN(end.getTime())) {
      return { valid: false, message: 'Invalid end date' };
    }

    if (start > end) {
      return { valid: false, message: 'Start date must be before end date' };
    }

    // Check if range is not too large (e.g., more than 5 years)
    const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
    if (daysDiff > 1825) { // 5 years
      return { valid: false, message: 'Date range cannot exceed 5 years' };
    }

    return { valid: true, daysDiff };
  }

  /**
   * Generate sample data for testing (development helper)
   * @param {string} type - Type of sample data ('trips', 'packing', 'posts')
   * @param {number} count - Number of records to generate
   * @returns {Array} Sample data array
   */
  static generateSampleData(type, count = 10) {
    const samples = [];
    const currentDate = new Date();

    for (let i = 0; i < count; i++) {
      const date = new Date(currentDate.getTime() - (i * 7 * 24 * 60 * 60 * 1000)); // Weekly intervals

      switch (type) {
        case 'trips':
          samples.push({
            destination: ['Bali', 'Tokyo', 'Paris', 'London', 'New York'][i % 5],
            type: ['Solo', 'Couple', 'Family', 'Group'][i % 4],
            budget: Math.floor(Math.random() * 3000) + 500,
            durationDays: Math.floor(Math.random() * 14) + 1,
            startDate: date,
            createdAt: date
          });
          break;

        case 'packing':
          samples.push({
            title: `Packing List ${i + 1}`,
            categories: [
              {
                name: 'Clothing',
                items: Array(5).fill().map((_, j) => ({
                  name: `Item ${j + 1}`,
                  checked: Math.random() > 0.5,
                  eco: Math.random() > 0.7
                }))
              }
            ],
            createdAt: date
          });
          break;

        case 'posts':
          samples.push({
            title: `Post ${i + 1}`,
            likeCount: Math.floor(Math.random() * 50),
            comments: Array(Math.floor(Math.random() * 10)).fill().map(() => ({})),
            date: date,
            createdAt: date
          });
          break;
      }
    }

    return samples;
  }
}

module.exports = AnalyticsHelper;