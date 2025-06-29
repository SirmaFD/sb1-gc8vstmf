import React, { useState } from 'react';
import { PerformanceMetrics, PerformanceGoal, SystemUsageMetrics } from '../types/performance';
import { Employee } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types/auth';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3,
  User,
  MessageSquare,
  Plus,
  Edit
} from 'lucide-react';

interface EmployeePerformanceTrackerProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeePerformanceTracker: React.FC<EmployeePerformanceTrackerProps> = ({
  employee,
  isOpen,
  onClose
}) => {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  if (!isOpen) return null;

  // Mock performance data - in real app, this would come from API
  const performanceMetrics: PerformanceMetrics = {
    id: 'perf1',
    employeeId: employee.id,
    period: '2024-Q1',
    systemUsageScore: 85,
    skillDevelopmentScore: 78,
    assessmentParticipationScore: 92,
    learningEngagementScore: 73,
    overallPerformanceScore: 82,
    goals: [
      {
        id: 'goal1',
        title: 'Complete React Advanced Learning Path',
        description: 'Finish all modules in the React Advanced learning path',
        category: 'learning-engagement',
        targetValue: 100,
        currentValue: 65,
        deadline: new Date('2024-03-31'),
        status: 'in-progress',
        priority: 'high'
      },
      {
        id: 'goal2',
        title: 'Conduct 5 Skill Assessments',
        description: 'Assess team members\' skills to support development',
        category: 'assessment-completion',
        targetValue: 5,
        currentValue: 3,
        deadline: new Date('2024-02-28'),
        status: 'in-progress',
        priority: 'medium'
      }
    ],
    feedback: [
      {
        id: 'fb1',
        fromUserId: 'manager1',
        fromUserName: 'John Manager',
        type: 'skill-assessment',
        message: 'Great progress on React skills. Consider focusing on performance optimization next.',
        rating: 4,
        isPublic: true,
        createdAt: new Date('2024-01-15')
      }
    ],
    lastReviewDate: new Date('2024-01-01'),
    nextReviewDate: new Date('2024-04-01'),
    status: 'on-track'
  };

  const systemUsage: SystemUsageMetrics = {
    loginFrequency: 18, // days this month
    skillsUpdatedCount: 4,
    assessmentsCompleted: 3,
    learningPathsStarted: 2,
    learningPathsCompleted: 1,
    timeSpentInSystem: 240, // minutes
    featuresUsed: ['skills', 'assessments', 'learning-paths', 'dashboard'],
    lastActiveDate: new Date()
  };

  const isOwnProfile = employee.email === user?.email;
  const canManagePerformance = hasPermission(Permission.EDIT_EMPLOYEE_PROFILES) || 
                               hasPermission(Permission.CONDUCT_ASSESSMENTS);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-100';
      case 'exceeds-expectations': return 'text-blue-600 bg-blue-100';
      case 'needs-improvement': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'system-usage', label: 'System Usage', icon: TrendingUp }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {isOwnProfile ? 'My Performance Dashboard' : `${employee.name} - Performance`}
              </h2>
              <p className="text-gray-600">{employee.role} • {employee.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Performance Summary */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(performanceMetrics.overallPerformanceScore)}`}>
                {performanceMetrics.overallPerformanceScore}%
              </div>
              <p className="text-xs text-gray-600 mt-1">Overall Score</p>
            </div>
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(performanceMetrics.systemUsageScore)}`}>
                {performanceMetrics.systemUsageScore}%
              </div>
              <p className="text-xs text-gray-600 mt-1">System Usage</p>
            </div>
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(performanceMetrics.skillDevelopmentScore)}`}>
                {performanceMetrics.skillDevelopmentScore}%
              </div>
              <p className="text-xs text-gray-600 mt-1">Skill Development</p>
            </div>
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(performanceMetrics.learningEngagementScore)}`}>
                {performanceMetrics.learningEngagementScore}%
              </div>
              <p className="text-xs text-gray-600 mt-1">Learning Engagement</p>
            </div>
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(performanceMetrics.status)}`}>
                {performanceMetrics.status.replace('-', ' ')}
              </div>
              <p className="text-xs text-gray-600 mt-1">Status</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Active Days</p>
                      <p className="text-lg font-bold text-blue-700">{systemUsage.loginFrequency}/30</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Assessments</p>
                      <p className="text-lg font-bold text-green-700">{systemUsage.assessmentsCompleted}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-purple-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">Learning Paths</p>
                      <p className="text-lg font-bold text-purple-700">{systemUsage.learningPathsCompleted}/{systemUsage.learningPathsStarted}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-orange-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">Time Spent</p>
                      <p className="text-lg font-bold text-orange-700">{Math.round(systemUsage.timeSpentInSystem / 60)}h</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance Highlights</h3>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Completed React Assessment</p>
                      <p className="text-xs text-green-700">Improved from Intermediate to Advanced level</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Active Learning Engagement</p>
                      <p className="text-xs text-blue-700">18 active days this month - above target</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Goal Deadline Approaching</p>
                      <p className="text-xs text-yellow-700">React Learning Path due in 2 weeks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Performance Goals</h3>
                {(canManagePerformance || isOwnProfile) && (
                  <button
                    onClick={() => setShowAddGoal(true)}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Goal
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {performanceMetrics.goals.map(goal => (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{goal.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                          goal.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          goal.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {goal.status.replace('-', ' ')}
                        </span>
                        {(canManagePerformance || isOwnProfile) && (
                          <button className="text-gray-400 hover:text-gray-600">
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="text-gray-900">{goal.currentValue}/{goal.targetValue}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(goal.currentValue / goal.targetValue) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Due: {goal.deadline.toLocaleDateString()}</span>
                        <span className="capitalize">{goal.priority} priority</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Performance Feedback</h3>
                {canManagePerformance && (
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feedback
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {performanceMetrics.feedback.map(feedback => (
                  <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{feedback.fromUserName}</p>
                          <p className="text-xs text-gray-500">{feedback.createdAt.toLocaleDateString()}</p>
                        </div>
                      </div>
                      {feedback.rating && (
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Award
                              key={i}
                              className={`w-4 h-4 ${
                                i < feedback.rating! ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{feedback.message}</p>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {feedback.type.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'system-usage' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">System Engagement Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Usage Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Login Frequency</span>
                      <span className="text-sm font-medium">{systemUsage.loginFrequency} days this month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Skills Updated</span>
                      <span className="text-sm font-medium">{systemUsage.skillsUpdatedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Assessments Completed</span>
                      <span className="text-sm font-medium">{systemUsage.assessmentsCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Time in System</span>
                      <span className="text-sm font-medium">{Math.round(systemUsage.timeSpentInSystem / 60)} hours</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Feature Adoption</h4>
                  <div className="space-y-2">
                    {systemUsage.featuresUsed.map(feature => (
                      <div key={feature} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-700 capitalize">{feature.replace('-', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Performance Insight</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {isOwnProfile ? 'Your' : `${employee.name}'s`} system engagement is above average. 
                      Consider exploring advanced features like learning path creation to further enhance productivity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Last review: {performanceMetrics.lastReviewDate.toLocaleDateString()} • 
            Next review: {performanceMetrics.nextReviewDate.toLocaleDateString()}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {canManagePerformance && (
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                Schedule Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePerformanceTracker;