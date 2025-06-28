import React from 'react';
import { Skill, SkillLevel, Priority } from '../types';
import { TrendingUp, Clock, Target, AlertCircle } from 'lucide-react';

interface SkillCardProps {
  skill: Skill;
  onClick: (skill: Skill) => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, onClick }) => {
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

  const getPriorityColor = (priority: Priority): string => {
    const colors = {
      [Priority.LOW]: 'text-gray-500',
      [Priority.MEDIUM]: 'text-yellow-500',
      [Priority.HIGH]: 'text-orange-500',
      [Priority.CRITICAL]: 'text-red-500'
    };
    return colors[priority];
  };

  const getProgressPercentage = (): number => {
    return (skill.level / skill.targetLevel) * 100;
  };

  const daysSinceAssessment = Math.floor(
    (new Date().getTime() - skill.lastAssessed.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-primary-300 animate-fade-in"
      onClick={() => onClick(skill)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{skill.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{skill.description}</p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <AlertCircle className={`w-4 h-4 ${getPriorityColor(skill.priority)}`} />
            <span className={`text-xs font-medium ${getPriorityColor(skill.priority)}`}>
              {skill.priority.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
              {getSkillLevelText(skill.level)}
            </span>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              {daysSinceAssessment} days ago
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress to target</span>
              <div className="flex items-center">
                <Target className="w-3 h-3 mr-1 text-gray-400" />
                <span className="text-gray-700">{getSkillLevelText(skill.targetLevel)}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>

          {skill.level < skill.targetLevel && (
            <div className="flex items-center text-xs text-primary-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>Growth opportunity</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillCard;