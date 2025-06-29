import React, { useState } from 'react';
import { Employee } from '../types';
import { PerformanceMetrics } from '../types/performance';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types/auth';
import EmployeePerformanceTracker from './EmployeePerformanceTracker';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Award,
  Calendar,
  BarChart3,
  Filter,
  Search,
  Eye,
  Edit
} from 'lucide-react';

interface PerformanceManagementDashboardProps {
  employees: Employee[];
}

const PerformanceManagementDashboard: React.FC<PerformanceManagementDashboardProps> = ({ 
  employees 
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const { hasPermission } = useAuth();

  const canManagePerformance = hasPermission(Permission.EDIT_EMPLOYEE_PROFILES) || 
                               hasPermission(Permission.CONDUCT_ASSESSMENTS);

  if (!canManagePerformance) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">You don't have permission to manage employee performance.</p>
      </div>
    );
  }

  // Mock performance data for each employee
  const getEmployeePerformanceMetrics = (employee: Employee): PerformanceMetrics => {
    const systemUsageScore = Math.floor(Math.random() * 40) + 60; // 60-100
    const skillDevelopmentScore = Math.floor(Math.random() * 30) + 70; // 70-100
    const assessmentScore = Math.floor(Math.random() * 50) + 50; // 50-100
    const learningScore = Math.floor(Math.random() * 40) + 60; // 60-100
    const overallScore = Math.round((systemUsageScore + skillDevelopmentScore + assessmentScore + learningScore) / 4);
    
    let status: 'on-track' | 'needs-improvement' | 'exceeds-expectations';
    if (overallScore >= 85) status = 'exceeds-expectations';
    else if (overallScore >= 70) status = 'on-track';
    else status = 'needs-improvement';

    return {
      id: `perf_${employee.id}`,
      employeeId: employee.id,
      period: '2024-Q1',
      systemUsageScore,
      skillDevelopmentScore,
      assessmentParticipationScore: assessmentScore,
      learningEngagementScore: learningScore,
      overallPerformanceScore: overallScore,
      goals: [],
      feedback: [],
      lastReviewDate: new Date('2024-01-01'),
      nextReviewDate: new Date('2024-04-01'),
      status
    };
  };

  const employeeMetrics = employees.map(emp => ({
    employee: emp,
    metrics: getEmployeePerformanceMetrics(emp)
  }));

  const departments = Array.from(new Set(employees.map(emp => emp.department)));

  const filteredEmployees = employeeMetrics.filter(({ employee, metrics }) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || metrics.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'exceeds-expectations': return 'bg-green-100 text-green-800';
      case 'on-track': return 'bg-blue-100 text-blue-800';
      case 'needs-improvement': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Calculate summary statistics
  const avgOverallScore = Math.round(
    employeeMetrics.reduce((sum, { metrics }) => sum + metrics.overallPerformanceScore, 0) / employeeMetrics.length
  );
  const highPerformers = employeeMetrics.filter(({ metrics }) => metrics.status === 'exceeds-expectations').length;
  const needsImprovement = employeeMetrics.filter(({ metrics }) => metrics.status === 'needs-improvement').length;
  const upcomingReviews = employeeMetrics.filter(({ metrics }) => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return metrics.nextReviewDate <= nextWeek;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Performance Management</h2>
        <p className="text-gray-600 mt-1">Monitor and manage employee performance across the organization</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Performance</p>
              <p className="text-2xl font-bold text-gray-900">{avgOverallScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Performers</p>
              <p className="text-2xl font-bold text-gray-900">{highPerformers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Needs Support</p>
              <p className="text-2xl font-bold text-gray-900">{needsImprovement}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reviews Due</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingReviews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="exceeds-expectations">Exceeds Expectations</option>
                <option value="on-track">On Track</option>
                <option value="needs-improvement">Needs Improvement</option>
              </select>
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employee Performance Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Employee Performance Overview</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  System Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skill Development
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map(({ employee, metrics }) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.role} • {employee.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-lg font-bold ${getScoreColor(metrics.overallPerformanceScore)}`}>
                        {metrics.overallPerformanceScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getScoreColor(metrics.systemUsageScore)}`}>
                      {metrics.systemUsageScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getScoreColor(metrics.skillDevelopmentScore)}`}>
                      {metrics.skillDevelopmentScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(metrics.status)}`}>
                      {metrics.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {metrics.nextReviewDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedEmployee(employee)}
                        className="text-primary-600 hover:text-primary-900 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 flex items-center">
                        <Edit className="w-4 h-4 mr-1" />
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Tracker Modal */}
      {selectedEmployee && (
        <EmployeePerformanceTracker
          employee={selectedEmployee}
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
};

export default PerformanceManagementDashboard;