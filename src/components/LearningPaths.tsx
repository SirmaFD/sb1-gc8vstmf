import React, { useState } from 'react';
import { Skill, SkillLevel, Employee } from '../types';
import { mockSkills, mockEmployees } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types/auth';
import CreateLearningPathModal from './CreateLearningPathModal';
import { 
  BookOpen, 
  Target, 
  Clock, 
  CheckCircle, 
  Play,
  Star,
  TrendingUp,
  Users,
  Plus,
  ArrowRight
} from 'lucide-react';

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

interface LearningModule {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'exercise' | 'assessment';
  duration: string;
  completed: boolean;
  required: boolean;
}

const LearningPaths: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, hasPermission } = useAuth();

  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([
    {
      id: 'path1',
      title: 'React Development Mastery',
      description: 'Comprehensive path to master React development from intermediate to expert level',
      targetSkill: 'React Development',
      currentLevel: SkillLevel.INTERMEDIATE,
      targetLevel: SkillLevel.EXPERT,
      estimatedDuration: '8 weeks',
      difficulty: 'intermediate',
      enrolledCount: 24,
      completionRate: 78,
      modules: [
        { id: 'm1', title: 'Advanced React Patterns', type: 'video', duration: '2h 30m', completed: true, required: true },
        { id: 'm2', title: 'State Management Deep Dive', type: 'reading', duration: '1h 15m', completed: true, required: true },
        { id: 'm3', title: 'Performance Optimization', type: 'exercise', duration: '3h', completed: false, required: true },
        { id: 'm4', title: 'Testing Strategies', type: 'video', duration: '2h', completed: false, required: true },
        { id: 'm5', title: 'Final Project Assessment', type: 'assessment', duration: '4h', completed: false, required: true }
      ]
    },
    {
      id: 'path2',
      title: 'Leadership Fundamentals',
      description: 'Build essential leadership skills for team management and project success',
      targetSkill: 'Team Leadership',
      currentLevel: SkillLevel.BEGINNER,
      targetLevel: SkillLevel.INTERMEDIATE,
      estimatedDuration: '6 weeks',
      difficulty: 'beginner',
      enrolledCount: 18,
      completionRate: 85,
      modules: [
        { id: 'm6', title: 'Leadership Principles', type: 'reading', duration: '1h', completed: false, required: true },
        { id: 'm7', title: 'Communication Skills', type: 'video', duration: '1h 30m', completed: false, required: true },
        { id: 'm8', title: 'Team Building Exercise', type: 'exercise', duration: '2h', completed: false, required: false },
        { id: 'm9', title: 'Conflict Resolution', type: 'video', duration: '1h 45m', completed: false, required: true }
      ]
    },
    {
      id: 'path3',
      title: 'TypeScript Advanced Concepts',
      description: 'Master advanced TypeScript features and patterns for large-scale applications',
      targetSkill: 'TypeScript',
      currentLevel: SkillLevel.INTERMEDIATE,
      targetLevel: SkillLevel.ADVANCED,
      estimatedDuration: '4 weeks',
      difficulty: 'advanced',
      enrolledCount: 12,
      completionRate: 65,
      modules: [
        { id: 'm10', title: 'Advanced Types', type: 'reading', duration: '2h', completed: false, required: true },
        { id: 'm11', title: 'Generics and Utility Types', type: 'video', duration: '1h 30m', completed: false, required: true },
        { id: 'm12', title: 'Practical Exercises', type: 'exercise', duration: '4h', completed: false, required: true }
      ]
    }
  ]);

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

  const getDifficultyColor = (difficulty: string): string => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors];
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

  const filteredPaths = learningPaths.filter(path => {
    if (filter === 'all') return true;
    if (filter === 'enrolled') return true; // In real app, check enrollment status
    if (filter === 'recommended') return path.completionRate > 70;
    return path.difficulty === filter;
  });

  const canCreatePaths = hasPermission(Permission.MANAGE_JOB_PROFILES) || hasPermission(Permission.SYSTEM_CONFIGURATION);

  const handleCreatePath = (newPathData: Omit<LearningPath, 'id' | 'enrolledCount' | 'completionRate'>) => {
    const newPath: LearningPath = {
      ...newPathData,
      id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      enrolledCount: 0,
      completionRate: 0
    };
    
    setLearningPaths(prevPaths => [...prevPaths, newPath]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Learning Paths</h2>
          <p className="text-gray-600 mt-1">Structured learning journeys to develop your skills</p>
        </div>
        {canCreatePaths && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Path
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Paths' },
            { id: 'enrolled', label: 'My Paths' },
            { id: 'recommended', label: 'Recommended' },
            { id: 'beginner', label: 'Beginner' },
            { id: 'intermediate', label: 'Intermediate' },
            { id: 'advanced', label: 'Advanced' }
          ].map(filterOption => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === filterOption.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Learning Paths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPaths.map(path => (
          <div
            key={path.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-primary-300"
            onClick={() => setSelectedPath(path)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{path.title}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                      {path.difficulty.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{path.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Skill Target</span>
                  <span className="font-medium text-gray-900">{path.targetSkill}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Level Progress</span>
                  <div className="flex items-center">
                    <span className="text-gray-700">{getSkillLevelText(path.currentLevel)}</span>
                    <ArrowRight className="w-3 h-3 mx-1 text-gray-400" />
                    <span className="text-gray-900 font-medium">{getSkillLevelText(path.targetLevel)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-gray-400" />
                    <span className="text-gray-900">{path.estimatedDuration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Enrolled</span>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-1 text-gray-400" />
                    <span className="text-gray-900">{path.enrolledCount}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="text-gray-900 font-medium">{path.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${path.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Learning Path Modal */}
      {selectedPath && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedPath.title}</h2>
                <p className="text-gray-600">{selectedPath.description}</p>
              </div>
              <button
                onClick={() => setSelectedPath(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Path Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Target className="w-4 h-4 text-primary-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Skill Development</span>
                  </div>
                  <p className="text-gray-900">{selectedPath.targetSkill}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {getSkillLevelText(selectedPath.currentLevel)} → {getSkillLevelText(selectedPath.targetLevel)}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Duration</span>
                  </div>
                  <p className="text-gray-900">{selectedPath.estimatedDuration}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedPath.modules.length} modules</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Star className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Success Rate</span>
                  </div>
                  <p className="text-gray-900">{selectedPath.completionRate}%</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedPath.enrolledCount} enrolled</p>
                </div>
              </div>

              {/* Learning Modules */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Modules</h3>
                <div className="space-y-3">
                  {selectedPath.modules.map((module, index) => {
                    const ModuleIcon = getModuleIcon(module.type);
                    return (
                      <div key={module.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            module.completed ? 'bg-green-100' : 'bg-gray-200'
                          }`}>
                            {module.completed ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <ModuleIcon className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="font-medium text-gray-900">{module.title}</h4>
                              {module.required && (
                                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                  Required
                                </span>
                              )}
                            </div>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-gray-600 capitalize">{module.type}</span>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-xs text-gray-600">{module.duration}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            module.completed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                          }`}
                        >
                          {module.completed ? 'Completed' : 'Start'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedPath(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                Enroll in Path
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Learning Path Modal */}
      <CreateLearningPathModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreatePath={handleCreatePath}
      />
    </div>
  );
};

export default LearningPaths;