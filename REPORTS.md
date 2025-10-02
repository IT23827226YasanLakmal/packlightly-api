# Report Generation Feature

The PackLightly API now includes a comprehensive report generation system that allows users to generate various types of analytics and insights from their travel data.

## Features

### Report Types Available

1. **Trip Analytics** (`trip_analytics`)
   - Trip distribution by type (Solo, Couple, Family, Group)
   - Top destinations and trends
   - Monthly trip patterns
   - Budget distribution analysis

2. **Packing Statistics** (`packing_statistics`)
   - Packing list completion rates
   - Items categorized by type
   - Most commonly packed items
   - Eco-friendly item percentage

3. **User Activity** (`user_activity`)
   - Monthly activity trends
   - Content distribution (trips, lists, posts)
   - Engagement metrics
   - AI usage statistics

4. **Eco Impact** (`eco_impact`)
   - Environmental impact assessment
   - Carbon footprint estimates
   - Eco-friendly choices tracking
   - Sustainability recommendations

5. **Budget Analysis** (`budget_analysis`)
   - Spending trends over time
   - Budget distribution by trip type
   - Average spending patterns
   - Budget range analysis

## API Endpoints

### Authentication
All report endpoints require Firebase authentication. Include the authorization header:
```
Authorization: Bearer <firebase-id-token>
```

### Endpoints

#### Get Report Types
```http
GET /api/reports/types
```
Returns available report types with descriptions.

#### Get Overview Statistics
```http
GET /api/reports/overview
```
Returns quick overview of user's reports.

#### List Reports
```http
GET /api/reports
```
Query Parameters:
- `type`: Filter by report type
- `fromDate`: Filter reports from date
- `toDate`: Filter reports to date
- `limit`: Limit number of results

#### Generate Report (Synchronous)
```http
POST /api/reports/generate-sync
```
Request Body:
```json
{
  "type": "trip_analytics",
  "title": "Custom Report Title",
  "filters": {
    "dateRange": {
      "startDate": "2025-01-01",
      "endDate": "2025-12-31"
    },
    "tripType": "Family",
    "destination": "Bali",
    "budgetRange": {
      "min": 1000,
      "max": 5000
    }
  }
}
```

#### Generate Report (Asynchronous)
```http
POST /api/reports/generate
```
Same request body as synchronous version. Returns immediately with status 202.

#### Get Specific Report
```http
GET /api/reports/:id
```
Returns detailed report data including charts and analytics.

#### Regenerate Report
```http
POST /api/reports/:id/regenerate
```
Regenerates an existing report with updated data.

#### Export Report
```http
GET /api/reports/export/:id/:format
```
Supported formats: `json`, `csv`

#### Delete Report
```http
DELETE /api/reports/:id
```
Deletes a report (only owner can delete).

## Report Data Structure

### Summary Data
Each report includes summary statistics relevant to the report type:
```json
{
  "summary": {
    "totalTrips": 15,
    "totalBudget": 25000,
    "avgTripDuration": 7.5,
    "ecoFriendlyPercentage": 85
  }
}
```

### Chart Data
Reports include chart-ready data for visualization:
```json
{
  "charts": [
    {
      "type": "pie",
      "title": "Trip Types Distribution",
      "data": [5, 8, 2],
      "labels": ["Solo", "Family", "Couple"]
    }
  ]
}
```

### Detailed Data
Additional detailed information for deep analysis:
```json
{
  "details": {
    "recentTrips": [...],
    "recommendations": [...],
    "trends": {...}
  }
}
```

## Filters

### Date Range Filter
```json
{
  "dateRange": {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  }
}
```

### Trip Type Filter
```json
{
  "tripType": "Family"
}
```
Valid values: `Solo`, `Couple`, `Family`, `Group`

### Budget Range Filter
```json
{
  "budgetRange": {
    "min": 1000,
    "max": 5000
  }
}
```

### Destination Filter
```json
{
  "destination": "Bali"
}
```
Supports partial matching (case-insensitive).

## Usage Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

// Generate a trip analytics report
const response = await axios.post('/api/reports/generate-sync', {
  type: 'trip_analytics',
  title: 'My Travel Analytics 2025',
  filters: {
    dateRange: {
      startDate: '2025-01-01',
      endDate: '2025-12-31'
    }
  }
}, {
  headers: {
    'Authorization': `Bearer ${firebaseToken}`,
    'Content-Type': 'application/json'
  }
});

console.log('Report generated:', response.data);
```

### Frontend Integration
```javascript
// Fetch and display reports
async function loadReports() {
  const response = await fetch('/api/reports', {
    headers: {
      'Authorization': `Bearer ${await getFirebaseToken()}`
    }
  });
  
  const { data: reports } = await response.json();
  
  reports.forEach(report => {
    displayReport(report);
  });
}

// Generate new report
async function generateReport(type, filters) {
  const response = await fetch('/api/reports/generate-sync', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getFirebaseToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ type, filters })
  });
  
  return response.json();
}
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid report type. Valid types are: trip_analytics, packing_statistics, ..."
}
```

#### 401 Unauthorized
```json
{
  "message": "Unauthorized: No token provided"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Report not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to generate report"
}
```

## Testing

### Running Tests
```bash
# Test report generation functionality
node test-reports.js

# Test analytics helper functions
node test-analytics.js

# Test API endpoints (requires server running)
npm start
# In another terminal:
node test-api.js
```

### Sample Data
The system includes sample data generation for testing:
```javascript
const AnalyticsHelper = require('./src/utils/analyticsHelper');
const sampleTrips = AnalyticsHelper.generateSampleData('trips', 10);
```

## Performance Considerations

1. **Large Datasets**: For users with many trips/lists, report generation may take time
2. **Caching**: Consider implementing report caching for frequently accessed reports
3. **Pagination**: Large result sets are automatically limited
4. **Async Generation**: Use async endpoints for complex reports

## Security

1. **Authentication**: All endpoints require valid Firebase tokens
2. **Authorization**: Users can only access their own reports
3. **Data Validation**: All inputs are validated before processing
4. **Rate Limiting**: Consider implementing rate limiting for report generation

## Future Enhancements

1. **PDF Export**: Add PDF generation capability
2. **Scheduled Reports**: Implement automatic report generation
3. **Email Reports**: Send reports via email
4. **Advanced Filters**: Add more filtering options
5. **Report Sharing**: Allow sharing reports with other users
6. **Dashboard Integration**: Create a dashboard view for multiple reports

## Troubleshooting

### Common Issues

1. **Empty Reports**: Ensure user has sufficient data
2. **Authentication Errors**: Verify Firebase token is valid
3. **Date Validation**: Check date formats and ranges
4. **Performance**: Use filters to limit data scope

### Debug Mode
Set `NODE_ENV=development` for detailed error logging.

## Database Schema

### Report Model
```javascript
{
  ownerUid: String,
  title: String,
  type: String,
  filters: Object,
  data: {
    summary: Object,
    charts: Array,
    details: Object
  },
  generatedAt: Date,
  status: String
}
```

The report generation feature provides comprehensive analytics capabilities for the PackLightly application, enabling users to gain valuable insights into their travel patterns and behaviors.