# New Report Categories Implementation

## Overview
Added two new report categories to the PackLightly API system:
1. **Eco Inventory** - Analysis of eco-friendly products
2. **News Section** - Analytics for news articles and publications

## Changes Made

### 1. Report Model (`src/models/Report.js`)
- **Updated enum values** in the `type` field to include:
  - `eco_inventory`
  - `news_section`

- **Added new summary fields** for eco inventory analytics:
  - `totalEcoProducts`: Total number of eco-friendly products
  - `ecoProductsByCategory`: Product distribution by category
  - `avgEcoRating`: Average eco-friendliness rating
  - `sustainableProducts`: Count of highly sustainable products (4+ rating)
  - `ecoProductAvailability`: Product availability by location

- **Added new summary fields** for news section analytics:
  - `totalNewsArticles`: Total number of news articles
  - `newsBySource`: Article distribution by source
  - `recentArticles`: Count of recent articles (last 7 days)
  - `trendingTopics`: Popular topics/keywords
  - `publicationFrequency`: Publication patterns by month

- **Added static method** `getReportTypes()` to return all available report types with descriptions

### 2. Report Service (`src/services/report.service.js`)
- **Added import** for News model
- **Added method** `generateEcoInventory(ownerUid, filters)`:
  - Analyzes Product collection for eco-friendly items
  - Supports filtering by minimum eco rating and category
  - Generates charts for category distribution, rating distribution, and location availability
  - Provides detailed statistics and top-rated products

- **Added method** `generateNewsSection(ownerUid, filters)`:
  - Analyzes News collection for article trends and patterns
  - Supports filtering by date range and source
  - Generates charts for source distribution, publication timeline, and trending topics
  - Provides analytics on recent articles and publication frequency

- **Updated** `generateReport()` method to handle new report types

## Report Features

### Eco Inventory Report
- **Summary Analytics**:
  - Total eco products count
  - Average eco rating across all products
  - Product distribution by category
  - Sustainable products count (4+ star rating)
  - Product availability by location

- **Charts**:
  - Bar chart: Products by Category
  - Pie chart: Eco Rating Distribution
  - Bar chart: Top Locations by Product Availability

- **Filters Supported**:
  - `minEcoRating`: Filter products by minimum eco rating
  - `category`: Filter by product category

### News Section Report
- **Summary Analytics**:
  - Total news articles count
  - Article distribution by source
  - Recent articles count (last 7 days)
  - Trending topics/keywords
  - Publication frequency patterns

- **Charts**:
  - Bar chart: Articles by Source
  - Line chart: Publication Timeline
  - Doughnut chart: Trending Topics

- **Filters Supported**:
  - `dateRange.startDate` / `dateRange.endDate`: Filter by publication date
  - `source`: Filter by news source

## API Usage

### Get Report Types
```
GET /api/reports/types
```
Now returns the new report types:
- `eco_inventory`: "Eco Inventory"
- `news_section`: "News Section"

### Generate Reports
```
POST /api/reports/generate
{
  "type": "eco_inventory",
  "title": "My Eco Inventory Report",
  "filters": {
    "minEcoRating": 3,
    "category": "Travel Gear"
  }
}
```

```
POST /api/reports/generate
{
  "type": "news_section", 
  "title": "News Analytics Report",
  "filters": {
    "dateRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    },
    "source": "eco-travel"
  }
}
```

## Testing
- All new functionality tested and verified
- New report types appear in the types endpoint
- Generation methods work correctly
- Model validation includes new enum values
- Service methods are properly registered

## Data Dependencies
- **Eco Inventory**: Requires Product collection with `eco`, `category`, and `availableLocation` fields
- **News Section**: Requires News collection with `title`, `source_id`, and `pubDate` fields