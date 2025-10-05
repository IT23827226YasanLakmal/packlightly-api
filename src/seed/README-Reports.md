# Report Seed Script

This script creates comprehensive sample data for the report generation feature in PackLightly API.

## Overview

The seed script generates realistic report data across all 6 report types:

1. **Trip Analytics** - Travel patterns, destinations, and trip trends
2. **Packing Statistics** - Packing efficiency and item analysis  
3. **User Activity** - Engagement metrics and content statistics
4. **Eco Impact** - Environmental footprint and sustainability metrics
5. **Budget Analysis** - Spending patterns and budget trends
6. **Destination Trends** - Travel preferences and destination insights

## Usage

### Run the Report Seed Script

```bash
npm run seed:reports
```

Or directly:
```bash
node src/seed/seedReports.js
```

### Run Complete Seed (includes reports)
```bash
npm run seed
```

## Generated Data

The script creates **12 sample reports** with diverse scenarios:

### Sample Users
- `aZlm3SLXkYfNGq3CuDmWTbmO3gF3` - Main user (8 reports)
- `bYmn4TLYlZgOHr4DvEnXUcnP4hG4` - Business traveler (2 reports)  
- `cZno5UMZmAhPIs5EwFoYVdoQ5iH5` - Family traveler (2 reports)

### Report Examples

#### Trip Analytics
- **Annual Trip Analytics 2025** - Complete year overview with 8 trips
- **Business Travel Analytics Q3** - Quarterly business travel analysis

#### Packing Statistics  
- **Comprehensive Packing Statistics** - 12 lists, 156 items, efficiency metrics
- **Family Packing Efficiency** - Family-specific packing insights

#### User Activity
- **User Engagement Analytics** - Activity trends, content distribution, badges

#### Eco Impact
- **Environmental Impact Assessment** - Carbon footprint, sustainability score
- **Business Travel Carbon Footprint** - Corporate sustainability metrics

#### Budget Analysis
- **Annual Budget Analysis** - $15K total budget across trip types

#### Destination Trends
- **Personal Destination Trends** - Travel preferences and recommendations

#### Special Cases
- **Scheduled Report** - Weekly automated packing efficiency
- **Failed Report** - Example of failed generation
- **Generating Report** - Example of report in progress

## Data Structure

Each report includes:

```javascript
{
  ownerUid: "string",           // User ID
  title: "string",              // Report title
  type: "enum",                 // Report type
  filters: {                    // Applied filters
    dateRange: { startDate, endDate },
    tripType: "string",
    destination: "string",
    budgetRange: { min, max }
  },
  data: {
    summary: { /* key metrics */ },
    charts: [{ 
      type: "pie|bar|line|doughnut",
      title: "string",
      data: [numbers],
      labels: [strings]
    }],
    details: { /* additional data */ }
  },
  generatedAt: Date,
  status: "pending|generating|completed|failed",
  isScheduled: Boolean,
  scheduleFrequency: "daily|weekly|monthly|quarterly",
  tags: [strings]
}
```

## Chart Types

Reports include various chart configurations:
- **Pie Charts** - Distribution data (trip types, categories)
- **Bar Charts** - Comparative data (spending, destinations)  
- **Line Charts** - Trend data (monthly patterns, activity)
- **Doughnut Charts** - Completion rates, allocations

## Features Demonstrated

### Advanced Analytics
- Multi-dimensional data analysis
- Trend identification
- Performance benchmarking
- Predictive insights

### User Segmentation
- Different user personas
- Varying travel patterns
- Business vs leisure travel
- Family vs solo travelers

### Report States
- ✅ **Completed** - Successfully generated
- ⏳ **Generating** - In progress
- ❌ **Failed** - Generation failed
- ⏰ **Scheduled** - Automated reports

### Filtering & Customization
- Date range filters
- Trip type filters
- Destination filters  
- Budget range filters

## API Testing

After seeding, you can test these endpoints:

```bash
# Get all report types
GET /api/reports/types

# List user reports
GET /api/reports

# Get specific report
GET /api/reports/:id

# Generate new report
POST /api/reports/generate
{
  "type": "trip_analytics",
  "title": "My Custom Report",
  "filters": {
    "dateRange": {
      "startDate": "2025-01-01",
      "endDate": "2025-12-31"
    }
  }
}
```

## Customization

### Add More Sample Data

```javascript
const { generateAdditionalReports } = require('./seedReports');

// Generate 10 more reports for a user
await generateAdditionalReports("userUid", 10);
```

### Modify Sample Users

Edit the `sampleUsers` array in `seedReports.js`:

```javascript
const sampleUsers = [
  "your-user-uid-1",
  "your-user-uid-2", 
  "your-user-uid-3"
];
```

## Notes

- Script clears existing reports before seeding
- All dates are set for 2025 (current demo year)
- Reports include realistic metrics and trends
- Data is designed to showcase all report features
- Compatible with existing API endpoints

## Dependencies

Requires the same dependencies as the main seed script:
- mongoose
- All model files (Report, Trip, PackingList, etc.)
- Database configuration

## Troubleshooting

If seeding fails:
1. Ensure database connection is working
2. Check that all required models exist
3. Verify Report model schema matches data structure
4. Run `npm run seed` first to create related data (trips, packing lists)