import React, { useState } from 'react';
import { JobProfile, JobLevel, SkillLevel, RequiredSkill } from '../types';
import { mockSkills } from '../data/mockData';
import { X, Plus, Trash2 } from 'lucide-react';

interface CreateJobProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProfile: (profile: Omit<JobProfile, 'id'>) => void;
}

const CreateJobProfileModal: React.FC<CreateJobProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreateProfile 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    level: JobLevel.MID,
    description: '',
    responsibilities: ['']
  });

  const [requiredSkills, setRequiredSkills] = useState<RequiredSkill[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<RequiredSkill[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProfile: Omit<JobProfile, 'id'> = {
      ...formData,
      responsibilities: formData.responsibilities.filter(r => r.trim() !== ''),
      requiredSkills,
      preferredSkills
    };

    onCreateProfile(newProfile);
    
    // Reset form
    setFormData({
      title: '',
      department: '',
      level: JobLevel.MID,
      description: '',
      responsibilities: ['']
    });
    setRequiredSkills([]);
    setPreferredSkills([]);
    
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

  const addResponsibility = () => {
    setFormData({
      ...formData,
      responsibilities: [...formData.responsibilities, '']
    });
  };

  const updateResponsibility = (index: number, value: string) => {
    const newResponsibilities = [...formData.responsibilities];
    newResponsibilities[index] = value;
    setFormData({
      ...formData,
      responsibilities: newResponsibilities
    });
  };

  const removeResponsibility = (index: number) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities.filter((_, i) => i !== index)
    });
  };

  const addRequiredSkill = () => {
    setRequiredSkills([
      ...requiredSkills,
      {
        skillId: mockSkills[0]?.id || '',
        minimumLevel: SkillLevel.INTERMEDIATE,
        weight: 5,
        mandatory: true
      }
    ]);
  };

  const updateRequiredSkill = (index: number, field: keyof RequiredSkill, value: any) => {
    const newSkills = [...requiredSkills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setRequiredSkills(newSkills);
  };

  const removeRequiredSkill = (index: number) => {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== index));
  };

  const addPreferredSkill = () => {
    setPreferredSkills([
      ...preferredSkills,
      {
        skillId: mockSkills[0]?.id || '',
        minimumLevel: SkillLevel.INTERMEDIATE,
        weight: 3,
        mandatory: false
      }
    ]);
  };

  const updatePreferredSkill = (index: number, field: keyof RequiredSkill, value: any) => {
    const newSkills = [...preferredSkills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setPreferredSkills(newSkills);
  };

  const removePreferredSkill = (index: number) => {
    setPreferredSkills(preferredSkills.filter((_, i) => i !== index));
  };

  const departments = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR', 'Finance'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Job Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Senior React Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Level *
            </label>
            <select
              required
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as JobLevel })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Object.values(JobLevel).map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
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
              placeholder="Describe the role and its purpose..."
            />
          </div>

          {/* Responsibilities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Key Responsibilities
              </label>
              <button
                type="button"
                onClick={addResponsibility}
                className="flex items-center text-sm text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Responsibility
              </button>
            </div>
            <div className="space-y-2">
              {formData.responsibilities.map((responsibility, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={responsibility}
                    onChange={(e) => updateResponsibility(index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter responsibility..."
                  />
                  {formData.responsibilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeResponsibility(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Required Skills
              </label>
              <button
                type="button"
                onClick={addRequiredSkill}
                className="flex items-center text-sm text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Required Skill
              </button>
            </div>
            <div className="space-y-3">
              {requiredSkills.map((skill, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-red-50 rounded-lg">
                  <select
                    value={skill.skillId}
                    onChange={(e) => updateRequiredSkill(index, 'skillId', e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {mockSkills.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <select
                    value={skill.minimumLevel}
                    onChange={(e) => updateRequiredSkill(index, 'minimumLevel', parseInt(e.target.value) as SkillLevel)}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Object.values(SkillLevel).filter(v => typeof v === 'number').map((level) => (
                      <option key={level} value={level}>
                        {getSkillLevelText(level as SkillLevel)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={skill.weight}
                    onChange={(e) => updateRequiredSkill(index, 'weight', parseInt(e.target.value))}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Weight (1-10)"
                  />
                  <button
                    type="button"
                    onClick={() => removeRequiredSkill(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preferred Skills */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Preferred Skills
              </label>
              <button
                type="button"
                onClick={addPreferredSkill}
                className="flex items-center text-sm text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Preferred Skill
              </button>
            </div>
            <div className="space-y-3">
              {preferredSkills.map((skill, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-blue-50 rounded-lg">
                  <select
                    value={skill.skillId}
                    onChange={(e) => updatePreferredSkill(index, 'skillId', e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {mockSkills.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <select
                    value={skill.minimumLevel}
                    onChange={(e) => updatePreferredSkill(index, 'minimumLevel', parseInt(e.target.value) as SkillLevel)}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Object.values(SkillLevel).filter(v => typeof v === 'number').map((level) => (
                      <option key={level} value={level}>
                        {getSkillLevelText(level as SkillLevel)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={skill.weight}
                    onChange={(e) => updatePreferredSkill(index, 'weight', parseInt(e.target.value))}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Weight (1-10)"
                  />
                  <button
                    type="button"
                    onClick={() => removePreferredSkill(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
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
              Create Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobProfileModal;