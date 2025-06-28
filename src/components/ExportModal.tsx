import React, { useState } from 'react';
import { X, Download, FileText, Calendar, Filter } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  dataType: 'skill-gaps' | 'reports';
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, title, dataType }) => {
  const [exportConfig, setExportConfig] = useState({
    format: 'csv',
    dateRange: 'all',
    includeCharts: true,
    includeDetails: true,
    filterBy: 'all'
  });

  if (!isOpen) return null;

  const handleExport = () => {
    // In a real app, this would generate and download the file
    console.log('Exporting data:', { dataType, config: exportConfig });
    
    // Simulate file download
    const filename = `${dataType}-export-${new Date().toISOString().split('T')[0]}.${exportConfig.format}`;
    alert(`Exporting ${filename}...`);
    
    onClose();
  };

  const formatOptions = [
    { value: 'csv', label: 'CSV (Comma Separated Values)', description: 'Best for spreadsheet applications' },
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

  const skillGapFilters = [
    { value: 'all', label: 'All Skill Gaps' },
    { value: 'high-priority', label: 'High Priority Only' },
    { value: 'critical', label: 'Critical Gaps Only' },
    { value: 'by-department', label: 'Group by Department' },
    { value: 'by-employee', label: 'Group by Employee' }
  ];

  const reportFilters = [
    { value: 'all', label: 'All Reports' },
    { value: 'overview', label: 'Overview Only' },
    { value: 'skills-analysis', label: 'Skills Analysis Only' },
    { value: 'department-comparison', label: 'Department Comparison Only' },
    { value: 'trends', label: 'Trends & Progress Only' }
  ];

  const filterOptions = dataType === 'skill-gaps' ? skillGapFilters : reportFilters;

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
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;