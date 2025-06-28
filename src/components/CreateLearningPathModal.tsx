import React, { useState } from 'react';
import { SkillLevel } from '../types';
import { mockSkills } from '../data/mockData';
import { X, Plus, Trash2, Play, BookOpen, Target, CheckCircle } from 'lucide-react';

interface LearningModule {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'exercise' | 'assessment';
  duration: string;
  completed: boolean;
  required: boolean;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetSkill: string;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  estimatedDuration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  modules: LearningModule[];
  enrolledCount: number;
  completionRate: number;
}

interface CreateLearningPathModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePath: (path: Omit<LearningPath, 'id' | 'enrolledCount' | 'completionRate'>) => void;
}

const CreateLearningPathModal: React.FC<CreateLearningPathModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreatePath 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetSkill: mockSkills[0]?.name || '',
    currentLevel: SkillLevel.BEGINNER,
    targetLevel: SkillLevel.INTERMEDIATE,
    estimatedDuration: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  });

  const [modules, setModules] = useState<Omit<LearningModule, 'id' | 'completed'>[]>([
    {
      title: '',
      type: 'video',
      duration: '',
      required: true
    }
  ]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPath: Omit<LearningPath, 'id' | 'enrolledCount' | 'completionRate'> = {
      ...formData,
      modules: modules
        .filter(m => m.title.trim() !== '')
        .map((module, index) => ({
          ...module,
          id: `module_${index + 1}`,
          completed: false
        }))
    };

    onCreatePath(newPath);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      targetSkill: mockSkills[0]?.name || '',
      currentLevel: SkillLevel.BEGINNER,
      targetLevel: SkillLevel.INTERMEDIATE,
      estimatedDuration: '',
      difficulty: 'beginner'
    });
    setModules([{
      title: '',
      type: 'video',
      duration: '',
      required: true
    }]);
    
    onClose();
  };

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

  const addModule = () => {
    setModules([
      ...modules,
      {
        title: '',
        type: 'video',
        duration: '',
        required: true
      }
    ]);
  };

  const updateModule = (index: number, field: keyof Omit<LearningModule, 'id' | 'completed'>, value: any) => {
    const newModules = [...modules];
    newModules[index] = { ...newModules[index], [field]: value };
    setModules(newModules);
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const getModuleIcon = (type: string) => {
    const icons = {
      video: Play,
      reading: BookOpen,
      exercise: Target,
      assessment: CheckCircle
    };
    return icons[type as keyof typeof icons] || BookOpen;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Learning Path</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Path Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., React Development Mastery"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="Describe what learners will achieve..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Skill *
              </label>
              <select
                required
                value={formData.targetSkill}
                onChange={(e) => setFormData({ ...formData, targetSkill: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {mockSkills.map(skill => (
                  <option key={skill.id} value={skill.name}>{skill.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level *
              </label>
              <select
                required
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting Level *
              </label>
              <select
                required
                value={formData.currentLevel}
                onChange={(e) => setFormData({ ...formData, currentLevel: parseInt(e.target.value) as SkillLevel })}
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
                Target Level *
              </label>
              <select
                required
                value={formData.targetLevel}
                onChange={(e) => setFormData({ ...formData, targetLevel: parseInt(e.target.value) as SkillLevel })}
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
                Estimated Duration *
              </label>
              <input
                type="text"
                required
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 8 weeks"
              />
            </div>
          </div>

          {/* Learning Modules */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Learning Modules
              </label>
              <button
                type="button"
                onClick={addModule}
                className="flex items-center text-sm text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Module
              </button>
            </div>
            <div className="space-y-3">
              {modules.map((module, index) => {
                const ModuleIcon = getModuleIcon(module.type);
                return (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={module.title}
                        onChange={(e) => updateModule(index, 'title', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Module title..."
                      />
                    </div>
                    
                    <select
                      value={module.type}
                      onChange={(e) => updateModule(index, 'type', e.target.value)}
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="video">Video</option>
                      <option value="reading">Reading</option>
                      <option value="exercise">Exercise</option>
                      <option value="assessment">Assessment</option>
                    </select>
                    
                    <input
                      type="text"
                      value={module.duration}
                      onChange={(e) => updateModule(index, 'duration', e.target.value)}
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Duration"
                    />
                    
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={module.required}
                          onChange={(e) => updateModule(index, 'required', e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-1 text-xs text-gray-600">Required</span>
                      </label>
                      
                      {modules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeModule(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Learning Path
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLearningPathModal;