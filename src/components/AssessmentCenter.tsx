import React, { useState } from 'react';
import { Employee, Skill, SkillLevel, Assessment } from '../types';
import { mockEmployees, mockAssessments } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types/auth';
import { 
  ClipboardCheck, 
  User, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Star,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const AssessmentCenter: React.FC = () => {
  const [employees] = useState<Employee[]>(mockEmployees);
  const [assessments] = useState<Assessment[]>(mockAssessments);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [assessmentForm, setAssessmentForm] = useState({
    newLevel: SkillLevel.BEGINNER,
    notes: '',
    evidence: '',
    nextReviewDate: ''
  });

  const { user, hasPermission } = useAuth();

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

  const getEmployeesNeedingAssessment = () => {
    let employeesToShow = employees;

    // If user can only view their own assessments, filter to just their data
    if (!hasPermission(Permission.CONDUCT_ASSESSMENTS) && 
        !hasPermission(Permission.VIEW_ALL_EMPLOYEES) &&
        !hasPermission(Permission.VIEW_TEAM_PROFILES) &&
        !hasPermission(Permission.VIEW_DEPARTMENT_PROFILES)) {
      employeesToShow = employees.filter(emp => emp.email === user?.email);
    }

    return employeesToShow.filter(emp => {
      if (!emp.lastAssessment) return true;
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return emp.lastAssessment < sixMonthsAgo;
    });
  };

  const getRecentAssessments = () => {
    let assessmentsToShow = assessments;

    // If user can only view their own assessments, filter accordingly
    if (!hasPermission(Permission.CONDUCT_ASSESSMENTS) && 
        !hasPermission(Permission.VIEW_ALL_EMPLOYEES) &&
        !hasPermission(Permission.VIEW_TEAM_PROFILES) &&
        !hasPermission(Permission.VIEW_DEPARTMENT_PROFILES)) {
      const currentEmployee = employees.find(emp => emp.email === user?.email);
      if (currentEmployee) {
        assessmentsToShow = assessments.filter(assessment => assessment.employeeId === currentEmployee.id);
      }
    }

    return assessmentsToShow
      .sort((a, b) => b.assessmentDate.getTime() - a.assessmentDate.getTime())
      .slice(0, 5);
  };

  const canAssessEmployee = (employee: Employee): boolean => {
    // Users can always assess themselves
    if (employee.email === user?.email) return true;
    
    // Check if user has assessment permissions for others
    return hasPermission(Permission.CONDUCT_ASSESSMENTS);
  };

  const handleStartAssessment = (employee: Employee, skill: Skill) => {
    if (!canAssessEmployee(employee)) {
      return;
    }

    setSelectedEmployee(employee);
    setSelectedSkill(skill);
    setAssessmentForm({
      newLevel: skill.level,
      notes: '',
      evidence: '',
      nextReviewDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const handleSubmitAssessment = () => {
    // In a real app, this would save to backend
    console.log('Assessment submitted:', {
      employee: selectedEmployee?.name,
      skill: selectedSkill?.name,
      assessor: user?.name,
      ...assessmentForm
    });
    
    // Reset form
    setSelectedEmployee(null);
    setSelectedSkill(null);
    setAssessmentForm({
      newLevel: SkillLevel.BEGINNER,
      notes: '',
      evidence: '',
      nextReviewDate: ''
    });
  };

  const employeesNeedingAssessment = getEmployeesNeedingAssessment();
  const recentAssessments = getRecentAssessments();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Assessment Center</h2>
        <p className="text-gray-600 mt-1">
          {hasPermission(Permission.CONDUCT_ASSESSMENTS) 
            ? 'Conduct and manage skill assessments' 
            : 'View and manage your skill assessments'
          }
        </p>
      </div>

      {/* Assessment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{recentAssessments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{employeesNeedingAssessment.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {assessments.filter(a => {
                  const thisMonth = new Date();
                  thisMonth.setDate(1);
                  return a.assessmentDate >= thisMonth;
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Improvement</p>
              <p className="text-2xl font-bold text-gray-900">+0.8</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employees Needing Assessment */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {hasPermission(Permission.CONDUCT_ASSESSMENTS) 
              ? 'Employees Needing Assessment' 
              : 'Your Skills Needing Assessment'
            }
          </h3>
          <div className="space-y-4">
            {employeesNeedingAssessment.map(employee => (
              <div key={employee.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{employee.name}</p>
                      <p className="text-sm text-gray-600">{employee.role}</p>
                      {employee.email === user?.email && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {employee.lastAssessment ? 
                      `${Math.floor((new Date().getTime() - employee.lastAssessment.getTime()) / (1000 * 60 * 60 * 24))} days ago` :
                      'Never assessed'
                    }
                  </div>
                </div>
                
                <div className="space-y-2">
                  {employee.skills.slice(0, 3).map(skill => (
                    <div key={skill.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{skill.name}</span>
                      {canAssessEmployee(employee) ? (
                        <button
                          onClick={() => handleStartAssessment(employee, skill)}
                          className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded hover:bg-primary-200 transition-colors"
                        >
                          {employee.email === user?.email ? 'Self-Assess' : 'Assess'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">No permission</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {employeesNeedingAssessment.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500">All assessments are up to date!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Assessments</h3>
          <div className="space-y-4">
            {recentAssessments.map(assessment => {
              const employee = employees.find(e => e.id === assessment.employeeId);
              const skill = employee?.skills.find(s => s.id === assessment.skillId);
              
              return (
                <div key={assessment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {employee?.name}
                        {employee?.email === user?.email && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">{skill?.name}</p>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">Completed</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {getSkillLevelText(assessment.previousLevel)} → {getSkillLevelText(assessment.newLevel)}
                    </span>
                    <span className="text-gray-500">
                      {assessment.assessmentDate.toLocaleDateString()}
                    </span>
                  </div>
                  
                  {assessment.notes && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{assessment.notes}</p>
                  )}
                </div>
              );
            })}
            {recentAssessments.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No recent assessments found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assessment Modal */}
      {selectedEmployee && selectedSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedEmployee.email === user?.email ? 'Self-Assessment' : 'Skill Assessment'}
                </h2>
                <p className="text-gray-600">{selectedEmployee.name} • {selectedSkill.name}</p>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Skill Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Current Skill Level</h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-medium">{getSkillLevelText(selectedSkill.level)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-600">Target</span>
                  <span className="font-medium">{getSkillLevelText(selectedSkill.targetLevel)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-600">Last Assessed</span>
                  <span className="font-medium">{selectedSkill.lastAssessed.toLocaleDateString()}</span>
                </div>
              </div>

              {/* Assessment Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Skill Level
                  </label>
                  <select
                    value={assessmentForm.newLevel}
                    onChange={(e) => setAssessmentForm({
                      ...assessmentForm,
                      newLevel: parseInt(e.target.value) as SkillLevel
                    })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Object.values(SkillLevel).filter(v => typeof v === 'number').map((level) => (
                      <option key={level} value={level}>
                        {getSkillLevelText(level as SkillLevel)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessment Notes
                  </label>
                  <textarea
                    value={assessmentForm.notes}
                    onChange={(e) => setAssessmentForm({
                      ...assessmentForm,
                      notes: e.target.value
                    })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={4}
                    placeholder={selectedEmployee.email === user?.email 
                      ? "Reflect on your skill development and progress..." 
                      : "Provide detailed assessment notes..."
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evidence
                  </label>
                  <textarea
                    value={assessmentForm.evidence}
                    onChange={(e) => setAssessmentForm({
                      ...assessmentForm,
                      evidence: e.target.value
                    })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder={selectedEmployee.email === user?.email 
                      ? "List examples of your work that demonstrate this skill level..." 
                      : "List evidence supporting this assessment..."
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Review Date
                  </label>
                  <input
                    type="date"
                    value={assessmentForm.nextReviewDate}
                    onChange={(e) => setAssessmentForm({
                      ...assessmentForm,
                      nextReviewDate: e.target.value
                    })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAssessment}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Submit Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentCenter;