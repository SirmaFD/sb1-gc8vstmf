import React, { useState, useEffect } from 'react';
import { Skill, Priority } from '../types';
import { skillCategories } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useUserSkills, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';
import SkillCard from './SkillCard';
import SkillModal from './SkillModal';
import AddSkillModal from './AddSkillModal';
import { Search, Filter, Plus, Lock, AlertCircle, Loader } from 'lucide-react';

interface SkillsListProps {
  skills?: Skill[]; // Optional fallback for mock data
  onUpdateSkill?: (updatedSkill: Skill) => void; // Optional fallback
  autoOpenAddModal?: boolean;
}

const SkillsList: React.FC<SkillsListProps> = ({ 
  skills: fallbackSkills = [], 
  onUpdateSkill: fallbackUpdate,
  autoOpenAddModal = false 
}) => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showAddModal, setShowAddModal] = useState(autoOpenAddModal);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const { user, canEditResource } = useAuth();

  // Use API or fallback to mock data
  const { data: apiSkills, loading, error, refetch } = useUserSkills(user?.id || '');
  const skills = apiSkills?.skills || fallbackSkills;

  // Mutations for skill operations
  const addSkillMutation = useApiMutation(
    (skillData: any) => apiService.addUserSkill(user!.id, skillData),
    {
      onSuccess: () => {
        refetch();
        setShowAddModal(false);
      },
      onError: (error) => {
        console.error('Failed to add skill:', error);
      }
    }
  );

  const updateSkillMutation = useApiMutation(
    ({ skillId, ...skillData }: any) => apiService.updateUserSkill(user!.id, skillId, skillData),
    {
      onSuccess: () => {
        refetch();
        setSelectedSkill(null);
      },
      onError: (error) => {
        console.error('Failed to update skill:', error);
      }
    }
  );

  const canEditSkills = canEditResource('skills');

  // Auto-open add modal if requested
  useEffect(() => {
    if (autoOpenAddModal) {
      setShowAddModal(true);
    }
  }, [autoOpenAddModal]);

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || skill.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const handleCloseModal = () => {
    setSelectedSkill(null);
  };

  const handleUpdateSkill = async (updatedSkill: Skill) => {
    if (canEditSkills) {
      try {
        if (user?.id) {
          // Use API
          await updateSkillMutation.mutate({
            skillId: updatedSkill.id,
            currentLevel: updatedSkill.level,
            targetLevel: updatedSkill.targetLevel,
            priority: updatedSkill.priority,
            evidence: updatedSkill.evidence?.join('\n'),
            developmentPlan: updatedSkill.developmentPlan
          });
        } else if (fallbackUpdate) {
          // Use fallback for mock data
          fallbackUpdate(updatedSkill);
          setSelectedSkill(null);
        }
      } catch (error) {
        console.error('Failed to update skill:', error);
      }
    }
  };

  const handleAddSkill = async (newSkillData: Omit<Skill, 'id'>) => {
    if (canEditSkills) {
      try {
        if (user?.id) {
          // Use API
          await addSkillMutation.mutate({
            skillId: newSkillData.id || `skill_${Date.now()}`, // Temporary ID for new skills
            currentLevel: newSkillData.level,
            targetLevel: newSkillData.targetLevel,
            priority: newSkillData.priority,
            evidence: newSkillData.evidence?.join('\n'),
            developmentPlan: newSkillData.developmentPlan
          });
        } else if (fallbackUpdate) {
          // Use fallback for mock data
          const newSkill: Skill = {
            ...newSkillData,
            id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
          fallbackUpdate(newSkill);
          setShowAddModal(false);
        }
      } catch (error) {
        console.error('Failed to add skill:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-primary-600 mr-3" />
        <span className="text-gray-600">Loading your skills...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Skills</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Skills</h2>
          <p className="text-gray-600 mt-1">
            {canEditSkills 
              ? 'Manage and track your skill development' 
              : 'View your current skills and progress'
            }
          </p>
        </div>
        {canEditSkills && (
          <button 
            onClick={() => setShowAddModal(true)}
            disabled={addSkillMutation.loading}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {addSkillMutation.loading ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Add Skill
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {skillCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Priorities</option>
              {Object.values(Priority).map(priority => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredSkills.length} of {skills.length} skills
          </p>
          {!canEditSkills && (
            <div className="flex items-center text-sm text-gray-500">
              <Lock className="w-4 h-4 mr-1" />
              View-only mode
            </div>
          )}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map(skill => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onClick={handleSkillClick}
          />
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No skills found matching your criteria</p>
          <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
          {canEditSkills && skills.length === 0 && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-4 flex items-center mx-auto px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Skill
            </button>
          )}
        </div>
      )}

      {/* Skill Modal */}
      {selectedSkill && (
        <SkillModal
          skill={selectedSkill}
          isOpen={!!selectedSkill}
          onClose={handleCloseModal}
          onUpdate={handleUpdateSkill}
          canEdit={canEditSkills}
          isUpdating={updateSkillMutation.loading}
        />
      )}

      {/* Add Skill Modal */}
      {canEditSkills && (
        <AddSkillModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddSkill={handleAddSkill}
          isAdding={addSkillMutation.loading}
        />
      )}
    </div>
  );
};

export default SkillsList;