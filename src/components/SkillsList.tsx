import React, { useState } from 'react';
import { Skill, Priority } from '../types';
import { skillCategories } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import SkillCard from './SkillCard';
import SkillModal from './SkillModal';
import AddSkillModal from './AddSkillModal';
import { Search, Filter, Plus, Lock } from 'lucide-react';

interface SkillsListProps {
  skills: Skill[];
  onUpdateSkill: (updatedSkill: Skill) => void;
}

const SkillsList: React.FC<SkillsListProps> = ({ skills, onUpdateSkill }) => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const { canEditResource } = useAuth();

  const canEditSkills = canEditResource('skills');

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

  const handleUpdateSkill = (updatedSkill: Skill) => {
    if (canEditSkills) {
      onUpdateSkill(updatedSkill);
      setSelectedSkill(null);
    }
  };

  const handleAddSkill = (newSkillData: Omit<Skill, 'id'>) => {
    if (canEditSkills) {
      const newSkill: Skill = {
        ...newSkillData,
        id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      onUpdateSkill(newSkill);
    }
  };

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
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
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
          {canEditSkills && (
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
        />
      )}

      {/* Add Skill Modal */}
      {canEditSkills && (
        <AddSkillModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddSkill={handleAddSkill}
        />
      )}
    </div>
  );
};

export default SkillsList;