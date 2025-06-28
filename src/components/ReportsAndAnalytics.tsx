import React, { useState } from 'react';
import { Employee, Skill, SkillLevel } from '../types';
import { mockEmployees, mockSkills } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types/auth';
import ExportModal from './ExportModal';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Users,
  Target,
  Award,
  Filter,
  FileText
} from 'lucide-react';

interface ReportData {
  skillDistribution: { level: SkillLevel; count: number; percentage: number }[];
  departmentStats: { department: string; avgLevel: number; employeeCount: number }[];
  skillProgress: { skillName: string; avgLevel: number; targetLevel: number; progress: number }[];
  monthlyTrends: { month: string; assessments: number; improvements: number }[];
}

const ReportsAndAnalytics: React.FC = () => {
  const [employees] = useState<Employee[]>(mockEmployees);
  const [skills] = useState<Skill[]>(mockSkills);
  const [selectedReport, setSelectedReport] = useState<string>('overview');
  const [dateRange, setDateRange] = useState<string>('last-6-months');
  const [showExportModal, setShowExportModal] = useState(false);
  const { hasPermission } = useAuth();

  const generateReportData = (): ReportData => {
    const allSkills = employees.flatMap(emp => emp.skills);
    
    // Skill Distribution
    const skillDistribution = Object.values(SkillLevel)
      .filter(v => typeof v === 'number')
      .map(level => {
        const count = allSkills.filter(skill => skill.level === level).length;
        return {
          level: level as SkillLevel,
          count,
          percentage: allSkills.length > 0 ? (count / allSkills.length) * 100 : 0
        };
      });

    // Department Stats
    const departments = Array.from(new Set(employees.map(emp => emp.department)));
    const departmentStats = departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept);
      const deptSkills = deptEmployees.flatMap(emp => emp.skills);
      const avgLevel = deptSkills.length > 0 
        ? deptSkills.reduce((sum, skill) => sum + skill.level, 0) / deptSkills.length 
        : 0;
      
      return {
        department: dept,
        avgLevel,
        employeeCount: deptEmployees.length
      };
    });

    // Skill Progress
    const uniqueSkills = Array.from(new Set(allSkills.map(s => s.name)));
    const skillProgress = uniqueSkills.map(skillName => {
      const skillInstances = allSkills.filter(s => s.name === skillName);
      const avgLevel = skillInstances.reduce((sum, skill) => sum + skill.level, 0) / skillInstances.length;
      const avgTarget = skillInstances.reduce((sum, skill) => sum + skill.targetLevel, 0) / skillInstances.length;
      
      return {
        skillName,
        avgLevel,
        targetLevel: avgTarget,
        progress: (avgLevel / avgTarget) * 100
      };
    });

    // Monthly Trends (mock data)
    const monthlyTrends = [
      { month: 'Jan', assessments: 45, improvements: 32 },
      { month: 'Feb', assessments: 52, improvements: 38 },
      { month: 'Mar', assessments: 48, improvements: 35 },
      { month: 'Apr', assessments: 61, improvements: 42 },
      { month: 'May', assessments: 55, improvements: 39 },
      { month: 'Jun', assessments: 58, improvements: 41 }
    ];

    return { skillDistribution, departmentStats, skillProgress, monthlyTrends };
  };

  const reportData = generateReportData();

  const getSkillLevelText = (level: SkillLevel): string => {
    const levels = {
      [SkillLevel.BEGINNER]: 'Beginner',
      [SkillLevel.INTERMEDIATE]: 'Intermediate',
      [SkillLevel.ADVANCED]: 'Advanced',
      [SkillLevel.EXPERT]: 'Expert',
      [SkillLevel.MASTER]: 'Master'
    };
    return levels[level];
  };

  const reportTypes = [
    { id: 'overview', name: 'Overview Report', icon: BarChart3 },
    { id: 'skills', name: 'Skills Analysis', icon: Target },
    { id: 'departments', name: 'Department Comparison', icon: Users },
    { id: 'trends', name: 'Trends & Progress', icon: TrendingUp }
  ];

  if (!hasPermission(Permission.VIEW_ORGANIZATION_DASHBOARD)) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">You don't have permission to view reports and analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights into organizational skills</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="last-month">Last Month</option>
            <option value="last-3-months">Last 3 Months</option>
            <option value="last-6-months">Last 6 Months</option>
            <option value="last-year">Last Year</option>
          </select>
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Report Type:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {reportTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedReport(type.id)}
              className={`flex items-center p-4 rounded-lg border-2 transition-colors ${
                selectedReport === type.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <type.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skill Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Level Distribution</h3>
            <div className="space-y-4">
              {reportData.skillDistribution.map(dist => (
                <div key={dist.level} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600">
                    {getSkillLevelText(dist.level)}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary-500 transition-all duration-500"
                        style={{ width: `${dist.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-900 font-medium text-right">
                    {dist.count} ({dist.percentage.toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Comparison */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
            <div className="space-y-4">
              {reportData.departmentStats.map(dept => (
                <div key={dept.department} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{dept.department}</h4>
                    <span className="text-sm text-gray-600">{dept.employeeCount} employees</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Avg. Skill Level:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${(dept.avgLevel / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {dept.avgLevel.toFixed(1)}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'skills' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Progress Analysis</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skill
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Avg.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Avg.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.skillProgress.map((skill, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {skill.skillName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {skill.avgLevel.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {skill.targetLevel.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              skill.progress >= 80 ? 'bg-green-500' : 
                              skill.progress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(skill.progress, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{skill.progress.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReport === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportData.departmentStats.map(dept => (
            <div key={dept.department} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{dept.department}</h3>
                  <p className="text-sm text-gray-600">{dept.employeeCount} employees</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Skill Level</span>
                  <span className="text-lg font-bold text-gray-900">{dept.avgLevel.toFixed(1)}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-primary-500"
                    style={{ width: `${(dept.avgLevel / 5) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Performance</span>
                  <span className={`font-medium ${
                    dept.avgLevel >= 4 ? 'text-green-600' :
                    dept.avgLevel >= 3 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {dept.avgLevel >= 4 ? 'Excellent' :
                     dept.avgLevel >= 3 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReport === 'trends' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Assessment Activity</h4>
              <div className="space-y-3">
                {reportData.monthlyTrends.map(trend => (
                  <div key={trend.month} className="flex items-center">
                    <div className="w-12 text-sm text-gray-600">{trend.month}</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${(trend.assessments / 70) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-sm text-gray-900 font-medium text-right">
                      {trend.assessments}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Skill Improvements</h4>
              <div className="space-y-3">
                {reportData.monthlyTrends.map(trend => (
                  <div key={trend.month} className="flex items-center">
                    <div className="w-12 text-sm text-gray-600">{trend.month}</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${(trend.improvements / 50) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-sm text-gray-900 font-medium text-right">
                      {trend.improvements}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Reports & Analytics"
        dataType="reports"
      />
    </div>
  );
};

export default ReportsAndAnalytics;