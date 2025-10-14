const ReportService = require('../services/report.service');
const ReportFormatHelpers = require('../utils/reportFormatHelpers');

class ReportController {
  // GET /api/reports - List all reports for the authenticated user
  static async list(req, res, next) {
    try {
      const { type, fromDate, toDate, limit } = req.query;
      const filters = { type, fromDate, toDate, limit };
      
      const reports = await ReportService.list(req.user.uid, filters);
      
      res.json({
        success: true,
        data: reports,
        count: reports.length,
        message: 'Reports retrieved successfully'
      });
    } catch (error) {
      console.error('List reports error:', error);
      next(error);
    }
  }

  // GET /api/reports/types - Get available report types
  static async getTypes(req, res, next) {
    try {
      const types = ReportService.getReportTypes();
      
      res.json({
        success: true,
        data: types,
        message: 'Report types retrieved successfully'
      });
    } catch (error) {
      console.error('Get report types error:', error);
      next(error);
    }
  }

  // GET /api/reports/:id - Get a specific report
  static async get(req, res, next) {
    try {
      const { id } = req.params;
      const report = await ReportService.get(id, req.user.uid);
      
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }
      
      res.json({
        success: true,
        data: report,
        message: 'Report retrieved successfully'
      });
    } catch (error) {
      console.error('Get report error:', error);
      next(error);
    }
  }

  // POST /api/reports/generate - Generate a new report
  static async generate(req, res, next) {
    try {
      const { type, filters = {}, title } = req.body;
      
      // Validate required fields
      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Report type is required'
        });
      }

      // Validate report type
      const validTypes = ReportService.getReportTypes().map(t => t.value);
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid report type. Valid types are: ${validTypes.join(', ')}`
        });
      }

      // Validate date range if provided
      if (filters.dateRange) {
        const { startDate, endDate } = filters.dateRange;
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
          return res.status(400).json({
            success: false,
            message: 'Start date must be before end date'
          });
        }
      }

      // Set status to generating
      res.status(202).json({
        success: true,
        message: 'Report generation started',
        status: 'generating'
      });

      // Generate report asynchronously
      try {
        const reportData = await ReportService.generateReport(type, req.user.uid, filters);
        
        // Remove _id field if it exists to prevent duplicate key error
        if (reportData._id) {
          delete reportData._id;
        }
        
        // If a custom title was provided, set it in the report data
        if (title && title.trim()) {
          reportData.title = title.trim();
        }
        
        // Create the report in the database
        const report = await ReportService.create(reportData);
        
        console.log(`Report generated successfully: ${report._id}`);
      } catch (generateError) {
        console.error('Report generation failed:', generateError);
        // In a production environment, you might want to save the error status to the database
      }

    } catch (error) {
      console.error('Generate report error:', error);
      next(error);
    }
  }

  // POST /api/reports/generate-sync - Generate a report synchronously (for smaller reports)
  static async generateSync(req, res, next) {
    try {
      const { type, filters = {}, title } = req.body;
      
      // Validate required fields
      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Report type is required'
        });
      }

      // Validate report type
      const validTypes = ReportService.getReportTypes().map(t => t.value);
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid report type. Valid types are: ${validTypes.join(', ')}`
        });
      }

      // Validate date range if provided
      if (filters.dateRange) {
        const { startDate, endDate } = filters.dateRange;
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
          return res.status(400).json({
            success: false,
            message: 'Start date must be before end date'
          });
        }
      }

      // Generate report synchronously
      const reportData = await ReportService.generateReport(type, req.user.uid, filters);
      
      // Remove _id field if it exists to prevent duplicate key error
      if (reportData._id) {
        delete reportData._id;
      }
      
      // Set title if provided
      if (title && title.trim()) {
        reportData.title = title.trim();
      }
      
      // Create the report in the database
      const report = await ReportService.create(reportData);
      
      res.status(201).json({
        success: true,
        data: report,
        message: 'Report generated successfully'
      });

    } catch (error) {
      console.error('Generate report sync error:', error);
      
      if (error.message.includes('Unknown report type')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      next(error);
    }
  }

  // DELETE /api/reports/:id - Delete a report (accessible to all users)
  static async remove(req, res, next) {
    try {
      const { id } = req.params;
      
      const deleted = await ReportService.remove(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Report deleted successfully'
      });
    } catch (error) {
      console.error('Delete report error:', error);
      next(error);
    }
  }

  // GET /api/reports/stats/overview - Get quick overview stats
  static async getOverview(req, res, next) {
    try {
      const reports = await ReportService.list(req.user.uid);
      
      const overview = {
        totalReports: reports.length,
        reportsByType: {},
        recentReports: reports.slice(0, 5),
        lastGenerated: reports.length > 0 ? reports[0].generatedAt : null
      };

      // Count reports by type
      reports.forEach(report => {
        overview.reportsByType[report.type] = (overview.reportsByType[report.type] || 0) + 1;
      });

      res.json({
        success: true,
        data: overview,
        message: 'Overview statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Get overview error:', error);
      next(error);
    }
  }

  // POST /api/reports/:id/regenerate - Regenerate an existing report with updated data
  static async regenerate(req, res, next) {
    try {
      const { id } = req.params;
      
      // Get existing report to use its type and filters
      const existingReport = await ReportService.get(id, req.user.uid);
      
      if (!existingReport) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      // Store the existing report's title and other properties
      const existingTitle = existingReport.title;
      const existingType = existingReport.type;
      const existingFilters = existingReport.filters;

      // Delete the old report
      await ReportService.remove(id);

      // Generate new report with same parameters
      // Note: ReportService.generateReport returns a plain object, not a Mongoose model
      const reportData = await ReportService.generateReport(
        existingType,
        req.user.uid,
        existingFilters
      );

      // Remove _id field if it exists to prevent duplicate key error
      if (reportData._id) {
        delete reportData._id;
      }

      // Create a new report in the database with the generated data and preserved title
      const newReportData = {
        ...reportData,
        title: existingTitle // Keep the same title
      };

      // Create the report using ReportService.create which returns a Mongoose model
      const newReport = await ReportService.create(newReportData);
      
      res.json({
        success: true,
        data: newReport,
        message: 'Report regenerated successfully'
      });
    } catch (error) {
      console.error('Regenerate report error:', error);
      next(error);
    }
  }

  // GET /api/reports/export/:id/:format - Export report in different formats
  static async export(req, res, next) {
    try {
      const { id, format } = req.params;
      
      if (!['json', 'csv', 'pdf', 'excel'].includes(format)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid format. Supported formats: json, csv, pdf, excel'
        });
      }

      const report = await ReportService.get(id, req.user.uid);
      
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      // Format report based on type before export
      const formattedReport = ReportController.formatReportForExport(report);
      const filename = `${report.title.replace(/\s+/g, '_')}_${report.generatedAt.toISOString().slice(0, 10)}`;

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        res.json(formattedReport);
      } else if (format === 'csv') {
        const csvContent = ReportController.generateCSV(formattedReport);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        res.send(csvContent);
      } else if (format === 'pdf') {
        const pdfBuffer = await ReportController.generatePDF(formattedReport);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
        res.send(pdfBuffer);
      } else if (format === 'excel') {
        const excelBuffer = await ReportController.generateExcel(formattedReport);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
        res.send(excelBuffer);
      }
    } catch (error) {
      console.error('Export report error:', error);
      next(error);
    }
  }

  // Helper method to format report for export based on type
  static formatReportForExport(report) {
    const baseInfo = {
      _id: report._id,
      title: report.title,
      type: report.type,
      generatedAt: report.generatedAt,
      status: report.status,
      format: report.format,
      isScheduled: report.isScheduled,
      scheduleFrequency: report.scheduleFrequency,
      lastGenerated: report.lastGenerated,
      tags: report.tags || [],
      filters: report.filters || {}
    };

    // Format based on report type
    switch (report.type) {
      case 'trip_analytics':
        return {
          ...baseInfo,
          summary: {
            totalTrips: report.data?.summary?.totalTrips || 0,
            uniqueDestinations: report.data?.summary?.uniqueDestinations || 0,
            favoriteDestination: report.data?.summary?.favoriteDestination || 'N/A',
            avgTripDuration: report.data?.summary?.avgTripDuration || 0,
            avgStayDuration: report.data?.summary?.avgStayDuration || 0,
            returnVisits: report.data?.summary?.returnVisits || 0,
            ecoFriendlyPercentage: report.data?.summary?.ecoFriendlyPercentage || 0,
            estimatedCarbonFootprint: report.data?.summary?.estimatedCarbonFootprint || 0,
            carbonSaved: report.data?.summary?.carbonSaved || 0,
            sustainabilityScore: report.data?.summary?.sustainabilityScore || 0
          },
          charts: ReportController.getRelevantCharts(report, ['Monthly Trips', 'Trip Types', 'Eco Score Trend', 'Destination Popularity'])
        };

      case 'packing_statistics':
        return {
          ...baseInfo,
          summary: {
            totalPackingLists: report.data?.summary?.totalPackingLists || 0,
            completionRate: report.data?.summary?.completionRate || 0,
            aiUsagePercentage: report.data?.summary?.aiUsagePercentage || 0,
            ecoFriendlyPercentage: report.data?.summary?.ecoFriendlyPercentage || 0,
            avgTripDuration: report.data?.summary?.avgTripDuration || 0,
            sustainabilityScore: report.data?.summary?.sustainabilityScore || 0,
            carbonSaved: report.data?.summary?.carbonSaved || 0
          },
          charts: ReportController.getRelevantCharts(report, ['Completion Rate Over Time', 'Eco Items Distribution', 'AI Usage Trends'])
        };

      case 'news_section':
        return {
          ...baseInfo,
          summary: {
            totalNewsArticles: report.data?.summary?.totalNewsArticles || 0,
            recentArticles: report.data?.summary?.recentArticles || 0,
            newsBySource: report.data?.summary?.newsBySource || {},
            trendingTopics: report.data?.summary?.trendingTopics || {},
            publicationFrequency: report.data?.summary?.publicationFrequency || {}
          },
          charts: ReportController.getRelevantCharts(report, ['Articles per Week', 'Source Distribution', 'Trending Topics'])
        };

      case 'eco_inventory':
        return {
          ...baseInfo,
          summary: {
            totalEcoProducts: report.data?.summary?.totalEcoProducts || 0,
            sustainableProducts: report.data?.summary?.sustainableProducts || 0,
            avgEcoRating: report.data?.summary?.avgEcoRating || 0,
            ecoProductsByCategory: report.data?.summary?.ecoProductsByCategory || {},
            ecoProductAvailability: report.data?.summary?.ecoProductAvailability || {},
            sustainabilityScore: report.data?.summary?.sustainabilityScore || 0
          },
          charts: ReportController.getRelevantCharts(report, ['Product Category Distribution', 'Rating Distribution', 'Availability Trends'])
        };

      case 'user_activity':
        return {
          ...baseInfo,
          summary: {
            totalPosts: report.data?.summary?.totalPosts || 0,
            totalLikes: report.data?.summary?.totalLikes || 0,
            avgLikesPerPost: report.data?.summary?.avgLikesPerPost || 0,
            ecoPostsShared: report.data?.summary?.ecoPostsShared || 0,
            ecoFriendlyPercentage: report.data?.summary?.ecoFriendlyPercentage || 0,
            sustainabilityScore: report.data?.summary?.sustainabilityScore || 0
          },
          charts: ReportController.getRelevantCharts(report, ['Post Activity Over Time', 'Engagement Rate', 'Eco Posts Trends'])
        };

      case 'eco_impact':
        return {
          ...baseInfo,
          summary: {
            sustainabilityScore: report.data?.summary?.sustainabilityScore || 0,
            carbonSaved: report.data?.summary?.carbonSaved || 0,
            estimatedCarbonFootprint: report.data?.summary?.estimatedCarbonFootprint || 0,
            ecoFriendlyPercentage: report.data?.summary?.ecoFriendlyPercentage || 0,
            totalTrips: report.data?.summary?.totalTrips || 0,
            totalPosts: report.data?.summary?.totalPosts || 0,
            ecoPostsShared: report.data?.summary?.ecoPostsShared || 0,
            totalEcoProducts: report.data?.summary?.totalEcoProducts || 0,
            sustainableProducts: report.data?.summary?.sustainableProducts || 0
          },
          charts: ReportController.getRelevantCharts(report, ['Carbon Impact Over Time', 'Sustainability Score Trend', 'Eco Actions'])
        };

      case 'budget_analysis':
        return {
          ...baseInfo,
          summary: {
            totalBudget: report.data?.summary?.totalBudget || 0,
            avgBudget: report.data?.summary?.avgBudget || 0,
            minBudget: report.data?.summary?.minBudget || 0,
            maxBudget: report.data?.summary?.maxBudget || 0,
            totalTrips: report.data?.summary?.totalTrips || 0,
            avgTripDuration: report.data?.summary?.avgTripDuration || 0,
            avgStayDuration: report.data?.summary?.avgStayDuration || 0,
            uniqueDestinations: report.data?.summary?.uniqueDestinations || 0,
            ecoFriendlyPercentage: report.data?.summary?.ecoFriendlyPercentage || 0
          },
          charts: ReportController.getRelevantCharts(report, ['Budget vs Actual', 'Spending Categories', 'Budget Trends'])
        };

      case 'destination_trends':
        return {
          ...baseInfo,
          summary: {
            totalTrips: report.data?.summary?.totalTrips || 0,
            uniqueDestinations: report.data?.summary?.uniqueDestinations || 0,
            favoriteDestination: report.data?.summary?.favoriteDestination || 'N/A',
            returnVisits: report.data?.summary?.returnVisits || 0,
            avgTripDuration: report.data?.summary?.avgTripDuration || 0,
            avgStayDuration: report.data?.summary?.avgStayDuration || 0,
            ecoFriendlyPercentage: report.data?.summary?.ecoFriendlyPercentage || 0,
            sustainabilityScore: report.data?.summary?.sustainabilityScore || 0,
            totalBudget: report.data?.summary?.totalBudget || 0,
            avgBudget: report.data?.summary?.avgBudget || 0
          },
          charts: ReportController.getRelevantCharts(report, ['Destination Popularity', 'Seasonal Trends', 'Return Visit Patterns'])
        };

      default:
        // For unknown types, return essential data with all available summary fields
        return {
          ...baseInfo,
          summary: report.data?.summary || {},
          charts: report.data?.charts?.slice(0, 3) || [], // Limit to 3 charts
          details: report.data?.details || {}
        };
    }
  }

  // Helper method to get relevant charts based on chart titles
  static getRelevantCharts(report, relevantTitles) {
    if (!report.data?.charts) return [];
    
    return report.data.charts.filter(chart => 
      relevantTitles.some(title => 
        chart.title?.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(chart.title?.toLowerCase())
      )
    ).slice(0, 3); // Limit to 3 most relevant charts
  }

  // Helper method to generate CSV
  static generateCSV(report) {
    let csvContent = '';
    
    // Header information
    csvContent += 'Report Information\n';
    csvContent += `Title,${report.title}\n`;
    csvContent += `Type,${report.type}\n`;
    csvContent += `Generated At,${report.generatedAt.toISOString()}\n`;
    csvContent += `Status,${report.status}\n\n`;
    
    // Summary data
    csvContent += 'Summary Metrics\n';
    csvContent += 'Metric,Value\n';
    
    // Handle both old structure (report.data.summary) and new structure (report.summary)
    const summaryData = report.summary || report.data?.summary;
    const objectData = {};
    
    if (summaryData) {
      Object.entries(summaryData).forEach(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        // Handle arrays and objects differently
        if (Array.isArray(value)) {
          csvContent += `${label},${value.join('; ')}\n`;
        } else if (typeof value === 'object' && value !== null) {
          // Store object data for separate table in CSV
          objectData[label] = value;
          csvContent += `${label},${Object.keys(value).length} categories (see detailed breakdown below)\n`;
        } else {
          csvContent += `${label},${value}\n`;
        }
      });
    }
    
    csvContent += '\n';
    
    // Add object data as separate sections
    Object.entries(objectData).forEach(([title, data]) => {
      csvContent += `${title} - Detailed Breakdown\n`;
      
      // Special handling for ecoProductAvailability - show only unique locations
      if (title.toLowerCase().includes('eco product availability')) {
        csvContent += 'Location\n';
        const uniqueLocations = [...new Set(Object.keys(data))];
        uniqueLocations.forEach(location => {
          csvContent += `${location}\n`;
        });
      } else {
        // Default handling for other object data
        csvContent += 'Category,Value\n';
        Object.entries(data).forEach(([key, value]) => {
          csvContent += `${key},${value}\n`;
        });
      }
      csvContent += '\n';
    });
    
    // Chart data - handle both structures
    const chartData = report.charts || report.data?.charts;
    if (chartData && chartData.length > 0) {
      chartData.forEach((chart, index) => {
        csvContent += `Chart ${index + 1}: ${chart.title}\n`;
        csvContent += 'Label,Value\n';
        
        if (chart.labels && chart.data) {
          chart.labels.forEach((label, i) => {
            csvContent += `${label},${chart.data[i] || 0}\n`;
          });
        }
        
        csvContent += '\n';
      });
    }
    
    return csvContent;
  }

  // Helper method to generate PDF
  static async generatePDF(report) {
    const puppeteer = require('puppeteer');
    
    const htmlContent = ReportController.generateHTMLTemplate(report);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    return pdfBuffer;
  }

  // Helper method to generate Excel
  static async generateExcel(report) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    
    // Main report sheet
    const worksheet = workbook.addWorksheet('Report Summary');
    
    // Title and header
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = report.title;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };
    
    // Report info
    let row = 3;
    worksheet.getCell(`A${row}`).value = 'Report Type:';
    worksheet.getCell(`B${row}`).value = report.type;
    row++;
    
    worksheet.getCell(`A${row}`).value = 'Generated At:';
    worksheet.getCell(`B${row}`).value = report.generatedAt;
    row++;
    
    worksheet.getCell(`A${row}`).value = 'Status:';
    worksheet.getCell(`B${row}`).value = report.status;
    row += 2;
    
    // Summary section - handle both structures
    const summaryData = report.summary || report.data?.summary;
    if (summaryData) {
      worksheet.getCell(`A${row}`).value = 'Summary Metrics';
      worksheet.getCell(`A${row}`).font = { bold: true };
      row++;
      
      worksheet.getCell(`A${row}`).value = 'Metric';
      worksheet.getCell(`B${row}`).value = 'Value';
      worksheet.getRow(row).font = { bold: true };
      row++;
      
      // Store object data for separate sheets
      const objectData = {};
      
      Object.entries(summaryData).forEach(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        worksheet.getCell(`A${row}`).value = label;
        
        // Handle arrays and objects for Excel
        if (Array.isArray(value)) {
          worksheet.getCell(`B${row}`).value = value.join(', ');
        } else if (typeof value === 'object' && value !== null) {
          // Store object data for separate sheet
          objectData[label] = value;
          worksheet.getCell(`B${row}`).value = `${Object.keys(value).length} categories (see ${label} sheet)`;
        } else {
          worksheet.getCell(`B${row}`).value = value;
        }
        row++;
      });
      
      // Create separate sheets for object data
      Object.entries(objectData).forEach(([title, data]) => {
        const objectSheet = workbook.addWorksheet(title.substring(0, 31)); // Excel sheet name limit
        
        // Sheet title
        objectSheet.getCell('A1').value = title;
        objectSheet.getCell('A1').font = { size: 14, bold: true };
        
        // Special handling for ecoProductAvailability - show only unique locations
        if (title.toLowerCase().includes('eco product availability')) {
          // Headers
          objectSheet.getCell('A3').value = 'Location';
          objectSheet.getRow(3).font = { bold: true };
          
          // Data - unique locations only
          const uniqueLocations = [...new Set(Object.keys(data))];
          let dataRow = 4;
          uniqueLocations.forEach(location => {
            objectSheet.getCell(`A${dataRow}`).value = location;
            dataRow++;
          });
        } else {
          // Default handling for other object data
          // Headers
          objectSheet.getCell('A3').value = 'Category';
          objectSheet.getCell('B3').value = 'Value';
          objectSheet.getRow(3).font = { bold: true };
          
          // Data
          let dataRow = 4;
          Object.entries(data).forEach(([key, value]) => {
            objectSheet.getCell(`A${dataRow}`).value = key;
            objectSheet.getCell(`B${dataRow}`).value = value;
            dataRow++;
          });
        }
        
        // Auto-fit columns
        objectSheet.columns.forEach(column => {
          column.width = 25;
        });
      });
    }
    
    // Charts as separate sheets - handle both structures
    const chartData = report.charts || report.data?.charts;
    if (chartData && chartData.length > 0) {
      chartData.forEach((chart, index) => {
        const chartSheet = workbook.addWorksheet(`Chart ${index + 1}`);
        
        // Chart title
        chartSheet.getCell('A1').value = chart.title;
        chartSheet.getCell('A1').font = { size: 14, bold: true };
        
        // Chart data
        chartSheet.getCell('A3').value = 'Label';
        chartSheet.getCell('B3').value = 'Value';
        chartSheet.getRow(3).font = { bold: true };
        
        if (chart.labels && chart.data) {
          chart.labels.forEach((label, i) => {
            chartSheet.getCell(`A${4 + i}`).value = label;
            chartSheet.getCell(`B${4 + i}`).value = chart.data[i] || 0;
          });
        }
        
        // Auto-fit columns
        chartSheet.columns.forEach(column => {
          column.width = 20;
        });
      });
    }
    
    // Auto-fit columns for main sheet
    worksheet.columns.forEach(column => {
      column.width = 25;
    });
    
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  // Helper method to generate HTML template for PDF
  static generateHTMLTemplate(report) {
    const formatValue = (value) => {
      if (typeof value === 'number') {
        return value.toLocaleString();
      }
      return value;
    };

    // Helper function to generate table for object data
    const generateObjectTable = (obj, title) => {
      if (!obj || typeof obj !== 'object') return '';
      
      const entries = Object.entries(obj);
      if (entries.length === 0) return '';
      
      // Special handling for ecoProductAvailability - show only unique locations
      if (title.toLowerCase().includes('eco product availability')) {
        const uniqueLocations = [...new Set(Object.keys(obj))];
        return `
          <div style="margin-top: 15px;">
            <div style="font-weight: bold; margin-bottom: 10px; color: #007bff; font-size: 14px;">${title}</div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Location</th>
                </tr>
              </thead>
              <tbody>
                ${uniqueLocations.map(location => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${location}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
      
      // Default handling for other object data
      return `
        <div style="margin-top: 15px;">
          <div style="font-weight: bold; margin-bottom: 10px; color: #007bff; font-size: 14px;">${title}</div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Category</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">Value</th>
              </tr>
            </thead>
            <tbody>
              ${entries.map(([key, value]) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${key}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatValue(value)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    };

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${report.title}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .title {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }
            .meta-info {
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
            }
            .section {
                margin-bottom: 30px;
            }
            .section-title {
                font-size: 18px;
                font-weight: bold;
                color: #007bff;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
                margin-bottom: 15px;
            }
            .summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }
            .metric-card {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                border-left: 4px solid #007bff;
            }
            .metric-label {
                font-size: 12px;
                color: #666;
                text-transform: uppercase;
                margin-bottom: 5px;
            }
            .metric-value {
                font-size: 20px;
                font-weight: bold;
                color: #333;
            }
            .chart-section {
                margin-bottom: 25px;
                page-break-inside: avoid;
            }
            .chart-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
            }
            .chart-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            }
            .chart-table th,
            .chart-table td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            .chart-table th {
                background-color: #f8f9fa;
                font-weight: bold;
            }
            .chart-table tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                text-align: center;
                font-size: 12px;
                color: #666;
            }
            .filter-item {
                margin-bottom: 8px;
                padding: 5px 0;
            }
            .filter-label {
                font-weight: bold;
                color: #333;
                margin-right: 10px;
            }
            .tag-list {
                display: inline-flex;
                flex-wrap: wrap;
                gap: 5px;
            }
            .tag {
                background: #007bff;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">${report.title}</div>
            <div class="meta-info">Report Type: ${report.type.replace(/_/g, ' ').toUpperCase()}</div>
            <div class="meta-info">Generated: ${new Date(report.generatedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</div>
            <div class="meta-info">Status: ${report.status.toUpperCase()}</div>
            ${report.isScheduled ? `<div class="meta-info">Scheduled: ${report.scheduleFrequency ? report.scheduleFrequency.toUpperCase() : 'YES'}</div>` : ''}
            ${report.lastGenerated ? `<div class="meta-info">Last Generated: ${new Date(report.lastGenerated).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
            })}</div>` : ''}
            ${report.tags && report.tags.length > 0 ? `<div class="meta-info">Tags: ${report.tags.join(', ')}</div>` : ''}
        </div>

        ${report.filters && Object.keys(report.filters).length > 0 ? `
        <div class="section">
            <div class="section-title">Report Filters</div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                ${report.filters.dateRange ? `
                    <div style="margin-bottom: 10px;">
                        <strong>Date Range:</strong> 
                        ${report.filters.dateRange.startDate ? new Date(report.filters.dateRange.startDate).toLocaleDateString() : 'Not specified'} - 
                        ${report.filters.dateRange.endDate ? new Date(report.filters.dateRange.endDate).toLocaleDateString() : 'Not specified'}
                    </div>
                ` : ''}
                ${report.filters.tripType ? `<div style="margin-bottom: 10px;"><strong>Trip Type:</strong> ${report.filters.tripType}</div>` : ''}
                ${report.filters.destination ? `<div style="margin-bottom: 10px;"><strong>Destination:</strong> ${report.filters.destination}</div>` : ''}
                ${report.filters.budgetRange ? `
                    <div style="margin-bottom: 10px;">
                        <strong>Budget Range:</strong> 
                        $${report.filters.budgetRange.min || 0} - $${report.filters.budgetRange.max || 'No limit'}
                    </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
    `;

    // Summary section - handle both old structure (report.data.summary) and new structure (report.summary)
    const summaryData = report.summary || report.data?.summary;
    if (summaryData) {
      html += `
        <div class="section">
            <div class="section-title">Summary Metrics</div>
            <div class="summary-grid">
      `;
      
      // Collect object data for separate table display
      const objectData = {};
      
      Object.entries(summaryData).forEach(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        let displayValue = formatValue(value);
        
        // Handle arrays and objects for display
        if (Array.isArray(value)) {
          displayValue = value.slice(0, 3).join(', ') + (value.length > 3 ? '...' : '');
        } else if (typeof value === 'object' && value !== null) {
          // Store object data for table display
          objectData[label] = value;
          displayValue = `${Object.keys(value).length} categories`;
        }
        
        html += `
          <div class="metric-card">
              <div class="metric-label">${label}</div>
              <div class="metric-value">${displayValue}</div>
          </div>
        `;
      });
      
      html += `
            </div>
      `;
      
      // Add object data as tables
      Object.entries(objectData).forEach(([title, data]) => {
        html += generateObjectTable(data, title);
      });
      
      html += `
        </div>
      `;
    }

    // Charts section - handle both structures
    const chartData = report.charts || report.data?.charts;
    if (chartData && chartData.length > 0) {
      html += `
        <div class="section">
            <div class="section-title">Charts & Analytics</div>
      `;
      
      chartData.forEach((chart, index) => {
        html += `
          <div class="chart-section">
              <div class="chart-title">${chart.title}</div>
              <table class="chart-table">
                  <thead>
                      <tr>
                          <th>Label</th>
                          <th>Value</th>
                      </tr>
                  </thead>
                  <tbody>
        `;
        
        if (chart.labels && chart.data) {
          chart.labels.forEach((label, i) => {
            html += `
              <tr>
                  <td>${label}</td>
                  <td>${formatValue(chart.data[i] || 0)}</td>
              </tr>
            `;
          });
        }
        
        html += `
                  </tbody>
              </table>
          </div>
        `;
      });
      
      html += `
        </div>
      `;
    }

    // Additional details
    if (report.data && report.data.details) {
      html += `
        <div class="section">
            <div class="section-title">Additional Details</div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                <pre style="white-space: pre-wrap; font-family: inherit;">${JSON.stringify(report.data.details, null, 2)}</pre>
            </div>
        </div>
      `;
    }

    html += `
        <div class="footer">
            <p>Generated by PackLightly Analytics System</p>
            <p>Report ID: ${report._id}</p>
            ${report.isScheduled ? `<p>Scheduled Report - Frequency: ${report.scheduleFrequency || 'Custom'}</p>` : ''}
            <p>Generated on: ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
            })}</p>
        </div>
    </body>
    </html>
    `;

    return html;
  }

  // GET /api/reports/sample/:type - Generate sample data for testing report formats
  static async getSampleReport(req, res, next) {
    try {
      const { type } = req.params;
      
      // Validate report type
      const validTypes = [
        'trip_analytics', 'packing_statistics', 'user_activity',
        'eco_impact', 'budget_analysis', 'destination_trends',
        'eco_inventory', 'news_section'
      ];
      
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid report type. Valid types are: ${validTypes.join(', ')}`
        });
      }

      // Generate sample data
      const sampleData = ReportFormatHelpers.generateSampleData(type);
      const sampleFilters = ReportFormatHelpers.generateDateRange('month');
      
      const sampleReport = ReportFormatHelpers.createReportStructure(
        'sample_user',
        type,
        sampleData,
        { dateRange: sampleFilters },
        { format: 'json', status: 'completed' }
      );

      // Validate the sample report
      const validation = ReportFormatHelpers.validateReportStructure(sampleReport);

      res.json({
        success: true,
        data: sampleReport,
        message: `Sample ${type} report generated`,
        validation,
        metadata: {
          isSample: true,
          generatedAt: new Date().toISOString(),
          reportType: type,
          description: `This is a sample report showing the standardized format for ${type} reports`
        }
      });

    } catch (error) {
      console.error('Generate sample report error:', error);
      next(error);
    }
  }

  // GET /api/reports/formats - Get all available report formats and their specifications
  static async getReportFormats(req, res, next) {
    try {
      const reportTypes = [
        {
          type: 'trip_analytics',
          name: 'Trip Analytics',
          description: 'Comprehensive analysis of travel patterns, destinations, and trip statistics',
          summaryFields: [
            'totalTrips', 'uniqueDestinations', 'favoriteDestination', 
            'avgTripDuration', 'ecoFriendlyPercentage', 'returnVisits',
            'estimatedCarbonFootprint', 'carbonSaved'
          ],
          chartTypes: ['bar', 'pie', 'line'],
          sampleData: ReportFormatHelpers.generateSampleData('trip_analytics')
        },
        {
          type: 'packing_statistics',
          name: 'Packing Statistics',
          description: 'Analysis of packing lists, item usage, and packing efficiency',
          summaryFields: [
            'totalPackingLists', 'completionRate', 'ecoFriendlyPercentage', 'aiUsagePercentage'
          ],
          chartTypes: ['pie', 'line', 'bar'],
          sampleData: ReportFormatHelpers.generateSampleData('packing_statistics')
        },
        {
          type: 'user_activity',
          name: 'User Activity',
          description: 'Overview of user engagement, posts, likes, and platform usage',
          summaryFields: [
            'totalPosts', 'totalLikes', 'avgLikesPerPost', 'ecoPostsShared'
          ],
          chartTypes: ['bar', 'pie', 'line'],
          sampleData: ReportFormatHelpers.generateSampleData('user_activity')
        },
        {
          type: 'eco_impact',
          name: 'Eco Impact',
          description: 'Environmental impact analysis and sustainability metrics',
          summaryFields: [
            'sustainabilityScore', 'carbonSaved', 'ecoFriendlyPercentage', 'estimatedCarbonFootprint'
          ],
          chartTypes: ['line', 'bar', 'pie'],
          sampleData: ReportFormatHelpers.generateSampleData('eco_impact')
        }
        // Add other types as needed
      ];

      res.json({
        success: true,
        data: {
          availableTypes: reportTypes,
          commonStructure: {
            base: {
              ownerUid: 'string (required)',
              title: 'string (required)',
              type: 'enum (required)',
              filters: 'object (optional)',
              format: 'enum [json, pdf, csv]',
              status: 'enum [pending, generating, completed, failed]'
            },
            data: {
              summary: 'object (key metrics)',
              charts: 'array (chart configurations)',
              details: 'object (detailed breakdown)'
            }
          },
          validationRules: {
            chartStructure: {
              type: 'required enum [bar, line, pie, doughnut]',
              title: 'required string',
              data: 'required array of numbers',
              labels: 'required array of strings (same length as data)'
            }
          }
        },
        message: 'Report formats specification retrieved successfully'
      });

    } catch (error) {
      console.error('Get report formats error:', error);
      next(error);
    }
  }
}

module.exports = ReportController;