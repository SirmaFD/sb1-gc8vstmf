import React, { useState } from 'react';
import { Employee, Skill, SkillLevel, JobProfile } from '../types';
import { mockEmployees, mockJobProfiles } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types/auth';
import ExportModal from './ExportModal';
import { 
  TrendingDown, 
  Target, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  Filter,
  Download
} from 'lucide-react';

interface SkillGap {
  employeeId: string;
  employeeName: string;
  skillId: string;
  skillName: string;
  currentLevel: SkillLevel;
  requiredLevel: SkillLevel;
  gap: number;
  priority: 'high' | 'medium' | 'low';
  jobProfileId?: string;
}

const SkillGapAnalysis: React.FC = () => {
  const [employees] = useState<Employee[]>(mockEmployees);
  const [jobProfiles] = useState<JobProfile[]>(mockJobProfiles);
  const [selectedJobProfile, setSelectedJobProfile] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [showExportModal, setShowExportModal] = useState(false);
  const { hasPermission } = useAuth();

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

  const calculateSkillGaps = (): SkillGap[] => {
    const gaps: SkillGap[] = [];

    employees.forEach(employee => {
      // Find matching job profile
      const jobProfile = jobProfiles.find(jp => 
        jp.title.toLowerCase().includes(employee.role.toLowerCase()) ||
        jp.department === employee.department
      );

      if (jobProfile) {
        jobProfile.requiredSkills.forEach(requiredSkill => {
          const employeeSkill = employee.skills.find(s => s.id === requiredSkill.skillId);
          
          if (employeeSkill && employeeSkill.level < requiredSkill.minimumLevel) {
            const gap = requiredSkill.minimumLevel - employeeSkill.level;
            gaps.push({
              employeeId: employee.id,
              employeeName: employee.name,
              skillId: employeeSkill.id,
              skillName: employeeSkill.name,
              currentLevel: employeeSkill.level,
              requiredLevel: requiredSkill.minimumLevel,
              gap,
              priority: gap >= 2 ? 'high' : gap >= 1 ? 'medium' : 'low',
              jobProfileId: jobProfile.id
            });
          }
        });
      }
    });

    return gaps;
  };

  const skillGaps = calculateSkillGaps();
  const departments = Array.from(new Set(employees.map(emp => emp.department)));

  const filteredGaps = skillGaps.filter(gap => {
    const employee = employees.find(emp => emp.id === gap.employeeId);
    const matchesDepartment = selectedDepartment === 'all' || employee?.department === selectedDepartment;
    const matchesJobProfile = selectedJobProfile === 'all' || gap.jobProfileId === selectedJobProfile;
    
    return matchesDepartment && matchesJobProfile;
  });

  const getGapStats = () => {
    const totalGaps = filteredGaps.length;
    const highPriorityGaps = filteredGaps.filter(gap => gap.priority === 'high').length;
    const affectedEmployees = new Set(filteredGaps.map(gap => gap.employeeId)).size;
    const avgGapSize = filteredGaps.length > 0 
      ? filteredGaps.reduce((sum, gap) => sum + gap.gap, 0) / filteredGaps.length 
      : 0;

    return { totalGaps, highPriorityGaps, affectedEmployees, avgGapSize };
  };

  const stats = getGapStats();

  const getPriorityColor = (priority: string): string => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors];
  };

  if (!hasPermission(Permission.VIEW_ORGANIZATION_DASHBOARD)) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">You don't have permission to view skill gap analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Skill Gap Analysis</h2>
          <p className="text-gray-600 mt-1">Identify and address skill gaps across the organization</p>
        </div>
        <button 
          onClick={() => setShowExportModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Gaps</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalGaps}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">{stats.highPriorityGaps}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Affected Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.affectedEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Gap Size</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgGapSize.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={selectedJobProfile}
            onChange={(e) => setSelectedJobProfile(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Job Profiles</option>
            {jobProfiles.map(profile => (
              <option key={profile.id} value={profile.id}>{profile.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Skill Gaps Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Identified Skill Gaps</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Required Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gap
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGaps.map((gap, index) => {
                const employee = employees.find(emp => emp.id === gap.employeeId);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{gap.employeeName}</div>
                        <div className="text-sm text-gray-500">{employee?.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{gap.skillName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{getSkillLevelText(gap.currentLevel)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{getSkillLevelText(gap.requiredLevel)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        <span className="text-sm font-medium text-red-600">{gap.gap} levels</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(gap.priority)}`}>
                        {gap.priority.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredGaps.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Skill Gaps Found</h3>
            <p className="text-gray-600">All employees meet the required skill levels for their roles.</p>
          </div>
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Skill Gap Analysis"
        dataType="skill-gaps"
      />
    </div>
  );
};

export default SkillGapAnalysis;