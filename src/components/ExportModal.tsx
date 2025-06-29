import React, { useState } from 'react';
import { X, Download, FileText, Calendar, Filter, Loader, CheckCircle } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  dataType: 'skill-gaps' | 'reports' | 'skills' | 'performance' | 'assessments';
  onExport?: (config: ExportConfig) => Promise<void>;
}

interface ExportConfig {
  format: string;
  dateRange: string;
  includeCharts: boolean;
  includeDetails: boolean;
  filterBy: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  dataType,
  onExport 
}) => {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'csv',
    dateRange: 'all',
    includeCharts: true,
    includeDetails: true,
    filterBy: 'all'
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportComplete(false);

    try {
      if (onExport) {
        await onExport(exportConfig);
      } else {
        // Default export behavior - call API directly
        await performExport();
      }
      
      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const performExport = async () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    const token = localStorage.getItem('skillharbor_access_token');
    
    let endpoint = '';
    switch (dataType) {
      case 'skills':
        endpoint = '/reports/skills-distribution';
        break;
      case 'skill-gaps':
        endpoint = '/reports/skill-gaps';
        break;
      case 'performance':
        endpoint = '/reports/performance-metrics';
        break;
      case 'assessments':
        endpoint = '/reports/assessments';
        break;
      case 'reports':
        endpoint = '/reports/organization-summary';
        break;
      default:
        endpoint = '/reports/organization-summary';
    }

    const params = new URLSearchParams({
      format: exportConfig.format,
      dateRange: exportConfig.dateRange,
      filterBy: exportConfig.filterBy,
      includeDetails: exportConfig.includeDetails.toString()
    });

    const response = await fetch(`${baseUrl}${endpoint}?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Export request failed');
    }

    // Handle file download
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('text/csv')) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataType}-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      // JSON response - convert to CSV client-side if needed
      const data = await response.json();
      console.log('Export data:', data);
      
      // For JSON responses, you might want to show a success message
      // or handle the data differently
    }
  };

  const formatOptions = [
    { value: 'csv', label: 'CSV (Comma Separated Values)', description: 'Best for spreadsheet applications like Excel' },
    { value: 'xlsx', label: 'Excel Workbook', description: 'Native Excel format with formatting' },
    { value: 'pdf', label: 'PDF Report', description: 'Formatted report for sharing and printing' },
    { value: 'json', label: 'JSON Data', description: 'Raw data for technical integration' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-3-months', label: 'Last 3 Months' },
    { value: 'last-6-months', label: 'Last 6 Months' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const getFilterOptions = () => {
    switch (dataType) {
      case 'skill-gaps':
        return [
          { value: 'all', label: 'All Skill Gaps' },
          { value: 'high-priority', label: 'High Priority Only' },
          { value: 'critical', label: 'Critical Gaps Only' },
          { value: 'by-department', label: 'Group by Department' },
          { value: 'by-employee', label: 'Group by Employee' }
        ];
      case 'skills':
        return [
          { value: 'all', label: 'All Skills' },
          { value: 'technical', label: 'Technical Skills Only' },
          { value: 'soft', label: 'Soft Skills Only' },
          { value: 'by-level', label: 'Group by Skill Level' },
          { value: 'by-category', label: 'Group by Category' }
        ];
      case 'performance':
        return [
          { value: 'all', label: 'All Employees' },
          { value: 'high-performers', label: 'High Performers Only' },
          { value: 'needs-improvement', label: 'Needs Improvement Only' },
          { value: 'by-department', label: 'Group by Department' }
        ];
      default:
        return [
          { value: 'all', label: 'All Data' },
          { value: 'summary', label: 'Summary Only' },
          { value: 'detailed', label: 'Detailed View' }
        ];
    }
  };

  const filterOptions = getFilterOptions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Download className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Export {title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isExporting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="space-y-3">
              {formatOptions.map(option => (
                <label key={option.value} className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={option.value}
                    checked={exportConfig.format === option.value}
                    onChange={(e) => setExportConfig({ ...exportConfig, format: e.target.value })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-1"
                    disabled={isExporting}
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <div className="flex items-center mb-3">
              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
              <label className="block text-sm font-medium text-gray-700">
                Date Range
              </label>
            </div>
            <select
              value={exportConfig.dateRange}
              onChange={(e) => setExportConfig({ ...exportConfig, dateRange: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isExporting}
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Options */}
          <div>
            <div className="flex items-center mb-3">
              <Filter className="w-4 h-4 text-gray-500 mr-2" />
              <label className="block text-sm font-medium text-gray-700">
                Data Filter
              </label>
            </div>
            <select
              value={exportConfig.filterBy}
              onChange={(e) => setExportConfig({ ...exportConfig, filterBy: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isExporting}
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Additional Options
            </label>
            <div className="space-y-3">
              {exportConfig.format === 'pdf' && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeCharts}
                    onChange={(e) => setExportConfig({ ...exportConfig, includeCharts: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    disabled={isExporting}
                  />
                  <span className="ml-2 text-sm text-gray-700">Include charts and visualizations</span>
                </label>
              )}
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportConfig.includeDetails}
                  onChange={(e) => setExportConfig({ ...exportConfig, includeDetails: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  disabled={isExporting}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Include detailed {dataType === 'skill-gaps' ? 'gap analysis' : 'analytics'} data
                </span>
              </label>
            </div>
          </div>

          {/* Preview Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Export Preview</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Format: {formatOptions.find(f => f.value === exportConfig.format)?.label} • 
                  Range: {dateRangeOptions.find(d => d.value === exportConfig.dateRange)?.label} • 
                  Filter: {filterOptions.find(f => f.value === exportConfig.filterBy)?.label}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Estimated file size: {exportConfig.format === 'pdf' ? '2-5 MB' : '50-200 KB'}
                </p>
              </div>
            </div>
          </div>

          {/* Export Status */}
          {isExporting && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-center">
                <Loader className="w-5 h-5 text-yellow-600 mr-2 animate-spin" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Exporting Data...</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please wait while we prepare your export file.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Export Complete */}
          {exportComplete && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-green-800">Export Complete!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your file has been downloaded successfully.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || exportComplete}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : exportComplete ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isExporting ? 'Exporting...' : exportComplete ? 'Complete!' : 'Export Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;