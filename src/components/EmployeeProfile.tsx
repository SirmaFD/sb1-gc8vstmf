import React, { useState } from 'react';
import { Employee, SkillLevel, Qualification, Certification } from '../types';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  BookOpen, 
  Target, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

interface EmployeeProfileProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employee, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('skills');

  if (!isOpen) return null;

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

  const getSkillLevelColor = (level: SkillLevel): string => {
    const colors = {
      [SkillLevel.BEGINNER]: 'bg-red-100 text-red-800',
      [SkillLevel.INTERMEDIATE]: 'bg-yellow-100 text-yellow-800',
      [SkillLevel.ADVANCED]: 'bg-blue-100 text-blue-800',
      [SkillLevel.EXPERT]: 'bg-green-100 text-green-800',
      [SkillLevel.MASTER]: 'bg-purple-100 text-purple-800'
    };
    return colors[level];
  };

  const getAverageSkillLevel = (): number => {
    if (employee.skills.length === 0) return 0;
    return employee.skills.reduce((sum, skill) => sum + skill.level, 0) / employee.skills.length;
  };

  const getSkillGaps = () => {
    return employee.skills.filter(skill => skill.level < skill.targetLevel);
  };

  const tabs = [
    { id: 'skills', label: 'Skills', icon: Target },
    { id: 'qualifications', label: 'Qualifications', icon: BookOpen },
    { id: 'certifications', label: 'Certifications', icon: Award }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-semibold text-gray-900">{employee.name}</h2>
              <p className="text-gray-600">{employee.role} • {employee.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Employee Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Mail className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Email</span>
              </div>
              <p className="text-gray-900">{employee.email}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Join Date</span>
              </div>
              <p className="text-gray-900">{employee.joinDate.toLocaleDateString()}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Avg. Skill Level</span>
              </div>
              <p className="text-gray-900">{getAverageSkillLevel().toFixed(1)}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Target className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Skill Gaps</span>
              </div>
              <p className="text-gray-900">{getSkillGaps().length}</p>
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
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {employee.skills.map(skill => (
                  <div key={skill.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{skill.name}</h4>
                        <p className="text-sm text-gray-600">{skill.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
                        {getSkillLevelText(skill.level)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress to target</span>
                        <span className="text-gray-700">{getSkillLevelText(skill.targetLevel)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(skill.level / skill.targetLevel) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      Last assessed: {skill.lastAssessed.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'qualifications' && (
            <div className="space-y-4">
              {employee.qualifications.map(qualification => (
                <div key={qualification.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900">{qualification.name}</h4>
                        {qualification.verified && (
                          <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{qualification.institution}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        Obtained: {qualification.dateObtained.toLocaleDateString()}
                        {qualification.expiryDate && (
                          <span className="ml-4">
                            Expires: {qualification.expiryDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {qualification.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
              {employee.qualifications.length === 0 && (
                <p className="text-gray-500 text-center py-8">No qualifications recorded</p>
              )}
            </div>
          )}

          {activeTab === 'certifications' && (
            <div className="space-y-4">
              {employee.certifications.map(certification => {
                const isExpiringSoon = certification.expiryDate && 
                  certification.expiryDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                
                return (
                  <div key={certification.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-900">{certification.name}</h4>
                          {certification.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                          )}
                          {isExpiringSoon && (
                            <AlertCircle className="w-4 h-4 text-orange-500 ml-2" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{certification.provider}</p>
                        {certification.credentialId && (
                          <p className="text-xs text-gray-500 mt-1">ID: {certification.credentialId}</p>
                        )}
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          Obtained: {certification.dateObtained.toLocaleDateString()}
                          {certification.expiryDate && (
                            <span className={`ml-4 ${isExpiringSoon ? 'text-orange-600 font-medium' : ''}`}>
                              Expires: {certification.expiryDate.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Award className="w-4 h-4 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                );
              })}
              {employee.certifications.length === 0 && (
                <p className="text-gray-500 text-center py-8">No certifications recorded</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;