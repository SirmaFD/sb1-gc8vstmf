import React, { useState } from 'react';
import { Skill, SkillLevel, Priority } from '../types';
import { X, Calendar, Target, TrendingUp, FileText, Lightbulb } from 'lucide-react';

interface SkillModalProps {
  skill: Skill;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedSkill: Skill) => void;
}

const SkillModal: React.FC<SkillModalProps> = ({ skill, isOpen, onClose, onUpdate }) => {
  const [editedSkill, setEditedSkill] = useState<Skill>(skill);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSave = () => {
    onUpdate(editedSkill);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSkill(skill);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{skill.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Level and Target */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-4 h-4 text-primary-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Current Level</span>
              </div>
              {isEditing ? (
                <select
                  value={editedSkill.level}
                  onChange={(e) => setEditedSkill({ ...editedSkill, level: parseInt(e.target.value) as SkillLevel })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.values(SkillLevel).filter(v => typeof v === 'number').map((level) => (
                    <option key={level} value={level}>
                      {getSkillLevelText(level as SkillLevel)}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-lg font-semibold text-gray-900">{getSkillLevelText(skill.level)}</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Target className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Target Level</span>
              </div>
              {isEditing ? (
                <select
                  value={editedSkill.targetLevel}
                  onChange={(e) => setEditedSkill({ ...editedSkill, targetLevel: parseInt(e.target.value) as SkillLevel })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.values(SkillLevel).filter(v => typeof v === 'number').map((level) => (
                    <option key={level} value={level}>
                      {getSkillLevelText(level as SkillLevel)}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-lg font-semibold text-gray-900">{getSkillLevelText(skill.targetLevel)}</p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress to Target</span>
              <span className="text-sm text-gray-500">
                {Math.round((skill.level / skill.targetLevel) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(skill.level / skill.targetLevel) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center mb-2">
              <FileText className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Description</span>
            </div>
            {isEditing ? (
              <textarea
                value={editedSkill.description || ''}
                onChange={(e) => setEditedSkill({ ...editedSkill, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="Describe this skill..."
              />
            ) : (
              <p className="text-gray-600">{skill.description || 'No description provided'}</p>
            )}
          </div>

          {/* Evidence */}
          <div>
            <div className="flex items-center mb-2">
              <Calendar className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Evidence</span>
            </div>
            <div className="space-y-2">
              {skill.evidence && skill.evidence.length > 0 ? (
                skill.evidence.map((evidence, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-800">{evidence}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No evidence recorded</p>
              )}
            </div>
          </div>

          {/* Development Plan */}
          <div>
            <div className="flex items-center mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Development Plan</span>
            </div>
            {isEditing ? (
              <textarea
                value={editedSkill.developmentPlan || ''}
                onChange={(e) => setEditedSkill({ ...editedSkill, developmentPlan: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="How will you develop this skill?"
              />
            ) : (
              <div className="bg-yellow-50 p-3 rounded-md">
                <p className="text-sm text-yellow-800">{skill.developmentPlan || 'No development plan set'}</p>
              </div>
            )}
          </div>

          {/* Last Assessed */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-1">
              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Last Assessed</span>
            </div>
            <p className="text-gray-600">{skill.lastAssessed.toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Edit Skill
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillModal;