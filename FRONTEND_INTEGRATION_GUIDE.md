# 🎯 Frontend Integration Examples for Dynamic Reports

This document provides practical examples for frontend developers to integrate with the new dynamic report system.

## 📡 API Endpoint

All report generation should use the enhanced endpoint that supports customization:

```
POST /api/reports/generate
```

## 🎨 Request Format Examples

### 1. 🚀 Lightweight Report (Dashboard View)
Perfect for quick dashboard widgets that need fast loading:

```json
{
  "type": "trip_analytics",
  "lightweight": true,
  "filters": {
    "dateRange": {
      "startDate": "2025-01-01",
      "endDate": "2025-10-01"
    }
  }
}
```

**Returns**: Only mandatory fields (totalTrips, uniqueDestinations, favoriteDestination, avgTripDuration, ecoFriendlyPercentage, charts)

### 2. 📊 Full Report (Detailed Analysis Page)
For comprehensive analysis pages with all available data:

```json
{
  "type": "trip_analytics", 
  "includeOptionalFields": true,
  "filters": {
    "dateRange": {
      "startDate": "2025-01-01",
      "endDate": "2025-10-01"
    },
    "tripType": "International",
    "destination": "Europe"
  }
}
```

**Returns**: All fields including detailed breakdowns, recommendations, and travel patterns

### 3. 🎯 Custom Report (Specific Use Cases)
For targeted features that need specific data subsets:

```json
{
  "type": "trip_analytics",
  "specificFields": [
    "details.topDestinations",
    "details.recommendations", 
    "summary.totalBudget",
    "summary.ecoFriendlyPercentage"
  ],
  "filters": {
    "dateRange": {
      "startDate": "2025-01-01", 
      "endDate": "2025-10-01"
    }
  }
}
```

**Returns**: Only requested fields plus mandatory ones

## 🗂️ Report Type Configurations

### Available Report Types

| Type | Description | Mandatory Fields | Optional Fields | Use Case |
|------|-------------|------------------|-----------------|----------|
| `trip_analytics` | Travel patterns & destinations | 6 | 14 | Main dashboard, travel insights |
| `packing_statistics` | Packing list completion & items | 4 | 11 | Packing efficiency analysis |
| `eco_inventory` | Eco-friendly product trends | 4 | 9 | Sustainability tracking |
| `news_insights` | Travel news & trending topics | 4 | 9 | News dashboard, trend analysis |
| `community_analytics` | Posts, comments, engagement | 4 | 9 | Community management |
| `user_activity` | User behavior & patterns | 4 | 9 | Admin analytics |
| `budget_analysis` | Spending patterns & trends | 4 | 8 | Financial planning |
| `destination_trends` | Popular destinations & seasons | 4 | 8 | Destination recommendations |
| `eco_impact` | Environmental impact metrics | 4 | 8 | Sustainability scoring |

## 💻 Frontend Implementation Examples

### React Hook for Report Generation

```jsx
import { useState, useEffect } from 'react';

const useReport = (type, filters = {}, options = {}) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const requestBody = {
        type,
        ...options, // includeOptionalFields, specificFields, lightweight
        filters
      };
      
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) throw new Error('Failed to generate report');
      
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { report, loading, error, generateReport };
};

// Usage examples:
// const dashboard = useReport('trip_analytics', dateRange, { lightweight: true });
// const fullReport = useReport('trip_analytics', filters, { includeOptionalFields: true });
// const customReport = useReport('trip_analytics', filters, { 
//   specificFields: ['details.topDestinations', 'summary.totalBudget'] 
// });
```

### Vue.js Composable

```javascript
import { ref, reactive } from 'vue';

export const useReportGeneration = () => {
  const report = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const generateReport = async (type, filters = {}, options = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...options, filters })
      });
      
      const data = await response.json();
      report.value = data;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return { report, loading, error, generateReport };
};
```

### Angular Service

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ReportOptions {
  includeOptionalFields?: boolean;
  specificFields?: string[];
  lightweight?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private http: HttpClient) {}

  generateReport(type: string, filters: any = {}, options: ReportOptions = {}): Observable<any> {
    const body = { type, ...options, filters };
    return this.http.post('/api/reports/generate', body);
  }

  // Convenience methods
  getDashboardReport(type: string, filters: any = {}) {
    return this.generateReport(type, filters, { lightweight: true });
  }

  getDetailedReport(type: string, filters: any = {}) {
    return this.generateReport(type, filters, { includeOptionalFields: true });
  }

  getCustomReport(type: string, fields: string[], filters: any = {}) {
    return this.generateReport(type, filters, { specificFields: fields });
  }
}
```

## 🎨 UI Implementation Patterns

### 1. Dashboard Cards (Lightweight)
```jsx
const DashboardCard = ({ reportType, dateRange }) => {
  const { report, loading } = useReport(reportType, { dateRange }, { lightweight: true });
  
  if (loading) return <Skeleton />;
  
  return (
    <Card>
      <CardHeader>{report.title}</CardHeader>
      <CardContent>
        {/* Display only summary metrics */}
        <Metric label="Total" value={report.data.summary.totalTrips} />
        <Metric label="Destinations" value={report.data.summary.uniqueDestinations} />
        <ChartComponent data={report.data.charts[0]} />
      </CardContent>
    </Card>
  );
};
```

### 2. Detailed Analysis Page (Full Report)
```jsx
const AnalysisPage = ({ reportType, filters }) => {
  const { report, loading } = useReport(reportType, filters, { includeOptionalFields: true });
  
  return (
    <Page>
      <ReportHeader report={report} />
      <SummarySection data={report?.data.summary} />
      <ChartsSection data={report?.data.charts} />
      {report?.data.details && (
        <DetailsSection data={report.data.details} />
      )}
    </Page>
  );
};
```

### 3. Custom Widget (Specific Fields)
```jsx
const TopDestinationsWidget = ({ dateRange }) => {
  const { report } = useReport(
    'trip_analytics',
    { dateRange },
    { specificFields: ['details.topDestinations'] }
  );
  
  return (
    <Widget title="Top Destinations">
      {report?.data.details?.topDestinations?.map(dest => (
        <DestinationItem key={dest.name} destination={dest} />
      ))}
    </Widget>
  );
};
```

## 🔧 Performance Tips

1. **Use lightweight reports** for dashboards and quick views
2. **Cache full reports** for detailed analysis pages
3. **Request specific fields** for widgets that only need certain data
4. **Implement progressive loading** - start with lightweight, then load details
5. **Use date range filters** to limit data scope

## 🎯 Best Practices

1. **Match report type to use case**: Don't request full reports for simple displays
2. **Validate field requests**: Check available fields before requesting custom ones
3. **Handle loading states**: Always show appropriate loading indicators
4. **Cache strategically**: Cache expensive full reports, refresh lightweight ones
5. **Error handling**: Gracefully handle missing or invalid fields

## 🧪 Testing Recommendations

Use the test endpoint to validate your requests:
```
GET /api/reports/types
```

This returns all available report types with their field configurations, helping you understand what data is available for each report type.

## 🔗 Related Documentation

- [Dynamic Report Structure](./DYNAMIC_REPORT_STRUCTURE.md) - Technical implementation details
- [Report Field Configuration](./src/config/reportFieldsConfig.js) - Available fields per report type
- [API Documentation](./src/docs/swagger.json) - Complete API reference