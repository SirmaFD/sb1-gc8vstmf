import React from 'react';
import { Skill, SkillLevel, Priority } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Target, AlertTriangle, Award, User, Calendar } from 'lucide-react';

interface DashboardProps {
  skills: Skill[];
}

const Dashboard: React.FC<DashboardProps> = ({ skills }) => {
  const { user } = useAuth();

  const getOverallProgress = (): number => {
    if (skills.length === 0) return 0;
    const totalProgress = skills.reduce((sum, skill) => sum + (skill.level / skill.targetLevel), 0);
    return Math.round((totalProgress / skills.length) * 100);
  };

  const getSkillsByLevel = (level: SkillLevel): number => {
    return skills.filter(skill => skill.level === level).length;
  };

  const getHighPrioritySkills = (): number => {
    return skills.filter(skill => skill.priority === Priority.HIGH || skill.priority === Priority.CRITICAL).length;
  };

  const getSkillsNeedingAttention = (): Skill[] => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return skills.filter(skill => 
      skill.lastAssessed < thirtyDaysAgo || 
      skill.level < skill.targetLevel
    ).slice(0, 5);
  };

  const stats = [
    {
      title: 'Overall Progress',
      value: `${getOverallProgress()}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Expert+ Skills',
      value: getSkillsByLevel(SkillLevel.EXPERT) + getSkillsByLevel(SkillLevel.MASTER),
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'High Priority',
      value: getHighPrioritySkills(),
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Total Skills',
      value: skills.length,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600">Here's your skills development overview</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skills Distribution Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Skills Distribution</h3>
        <div className="space-y-4">
          {Object.values(SkillLevel).filter(v => typeof v === 'number').map((level) => {
            const count = getSkillsByLevel(level as SkillLevel);
            const percentage = skills.length > 0 ? (count / skills.length) * 100 : 0;
            const levelNames = {
              [SkillLevel.BEGINNER]: 'Beginner',
              [SkillLevel.INTERMEDIATE]: 'Intermediate',
              [SkillLevel.ADVANCED]: 'Advanced',
              [SkillLevel.EXPERT]: 'Expert',
              [SkillLevel.MASTER]: 'Master'
            };
            const colors = {
              [SkillLevel.BEGINNER]: 'bg-red-500',
              [SkillLevel.INTERMEDIATE]: 'bg-yellow-500',
              [SkillLevel.ADVANCED]: 'bg-blue-500',
              [SkillLevel.EXPERT]: 'bg-green-500',
              [SkillLevel.MASTER]: 'bg-purple-500'
            };

            return (
              <div key={level} className="flex items-center">
                <div className="w-24 text-sm text-gray-600">
                  {levelNames[level as SkillLevel]}
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${colors[level as SkillLevel]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-900 font-medium">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills Needing Attention */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Needing Attention</h3>
        <div className="space-y-3">
          {getSkillsNeedingAttention().map((skill) => {
            const daysSinceAssessment = Math.floor(
              (new Date().getTime() - skill.lastAssessed.getTime()) / (1000 * 60 * 60 * 24)
            );
            
            return (
              <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{skill.name}</p>
                  <p className="text-sm text-gray-600">
                    {daysSinceAssessment > 30 ? `Last assessed ${daysSinceAssessment} days ago` : 'Below target level'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {skill.priority === Priority.HIGH || skill.priority === Priority.CRITICAL ? (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  ) : null}
                  <span className="text-sm text-gray-500">
                    {skill.level}/{skill.targetLevel}
                  </span>
                </div>
              </div>
            );
          })}
          {getSkillsNeedingAttention().length === 0 && (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-500">All skills are up to date!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
            <Target className="w-6 h-6 text-primary-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-primary-900">Add New Skill</p>
              <p className="text-sm text-primary-700">Track a new skill</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Calendar className="w-6 h-6 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-green-900">Self Assessment</p>
              <p className="text-sm text-green-700">Update your skills</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <Award className="w-6 h-6 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-purple-900">Learning Paths</p>
              <p className="text-sm text-purple-700">Explore development</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;