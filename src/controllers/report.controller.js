const ReportService = require('../services/report.service');

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
        const report = await ReportService.generateReport(type, req.user.uid, filters);
        
        // If a custom title was provided, update it
        if (title && title.trim()) {
          report.title = title.trim();
          await report.save();
        }
        
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
      const report = await ReportService.generateReport(type, req.user.uid, filters);
      
      // Update title if provided
      if (title && title.trim()) {
        report.title = title.trim();
        await report.save();
      }
      
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

  // DELETE /api/reports/:id - Delete a report
  static async remove(req, res, next) {
    try {
      const { id } = req.params;
      
      const deleted = await ReportService.remove(id, req.user.uid);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Report not found or you do not have permission to delete it'
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

      // Delete the old report
      await ReportService.remove(id, req.user.uid);

      // Generate new report with same parameters
      const newReport = await ReportService.generateReport(
        existingReport.type,
        req.user.uid,
        existingReport.filters
      );

      // Keep the same title
      newReport.title = existingReport.title;
      await newReport.save();
      
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
      
      if (!['json', 'csv'].includes(format)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid format. Supported formats: json, csv'
        });
      }

      const report = await ReportService.get(id, req.user.uid);
      
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      const filename = `${report.title.replace(/\s+/g, '_')}_${report.generatedAt.toISOString().slice(0, 10)}`;

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        res.json(report);
      } else if (format === 'csv') {
        // Basic CSV export (can be enhanced based on report type)
        let csvContent = 'Report Type,Generated At,Total Items\n';
        csvContent += `${report.type},${report.generatedAt.toISOString()},${JSON.stringify(report.data.summary)}\n`;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        res.send(csvContent);
      }
    } catch (error) {
      console.error('Export report error:', error);
      next(error);
    }
  }
}

module.exports = ReportController;