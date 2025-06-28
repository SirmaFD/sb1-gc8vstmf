import React, { useState } from 'react';
import { JobProfile, SkillLevel, JobLevel } from '../types';
import { mockJobProfiles } from '../data/mockData';
import CreateJobProfileModal from './CreateJobProfileModal';
import { Briefcase, Users, Target, Star, Plus } from 'lucide-react';

const JobProfiles: React.FC = () => {
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>(mockJobProfiles);
  const [selectedProfile, setSelectedProfile] = useState<JobProfile | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getJobLevelColor = (level: JobLevel): string => {
    const colors = {
      [JobLevel.ENTRY]: 'bg-gray-100 text-gray-800',
      [JobLevel.JUNIOR]: 'bg-blue-100 text-blue-800',
      [JobLevel.MID]: 'bg-green-100 text-green-800',
      [JobLevel.SENIOR]: 'bg-purple-100 text-purple-800',
      [JobLevel.LEAD]: 'bg-orange-100 text-orange-800',
      [JobLevel.PRINCIPAL]: 'bg-red-100 text-red-800'
    };
    return colors[level];
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

  const handleCreateProfile = (newProfileData: Omit<JobProfile, 'id'>) => {
    const newProfile: JobProfile = {
      ...newProfileData,
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    setJobProfiles(prevProfiles => [...prevProfiles, newProfile]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Competency Profiles</h2>
          <p className="text-gray-600 mt-1">Define skill requirements for different roles</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Profile
        </button>
      </div>

      {/* Job Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobProfiles.map(profile => (
          <div
            key={profile.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-primary-300"
            onClick={() => setSelectedProfile(profile)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{profile.title}</h3>
                    <p className="text-sm text-gray-600">{profile.department}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobLevelColor(profile.level)}`}>
                  {profile.level.toUpperCase()}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{profile.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Required Skills</span>
                  <span className="text-sm font-medium text-gray-900">{profile.requiredSkills.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Preferred Skills</span>
                  <span className="text-sm font-medium text-gray-900">{profile.preferredSkills.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Responsibilities</span>
                  <span className="text-sm font-medium text-gray-900">{profile.responsibilities.length}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Job Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedProfile.title}</h2>
                <p className="text-gray-600">{selectedProfile.department}</p>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Level</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobLevelColor(selectedProfile.level)}`}>
                        {selectedProfile.level.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Department</span>
                      <span className="text-sm font-medium text-gray-900">{selectedProfile.department}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-sm text-gray-600">{selectedProfile.description}</p>
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProfile.requiredSkills.map((reqSkill, index) => (
                    <div key={index} className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Skill {reqSkill.skillId}</span>
                        <div className="flex items-center space-x-2">
                          {reqSkill.mandatory && (
                            <Star className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Weight: {reqSkill.weight}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Minimum Level</span>
                        <span className="text-sm font-medium text-gray-900">
                          {getSkillLevelText(reqSkill.minimumLevel)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferred Skills */}
              {selectedProfile.preferredSkills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferred Skills</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProfile.preferredSkills.map((prefSkill, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">Skill {prefSkill.skillId}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Weight: {prefSkill.weight}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Minimum Level</span>
                          <span className="text-sm font-medium text-gray-900">
                            {getSkillLevelText(prefSkill.minimumLevel)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Responsibilities</h3>
                <ul className="space-y-2">
                  {selectedProfile.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-gray-600">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedProfile(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Job Profile Modal */}
      <CreateJobProfileModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateProfile={handleCreateProfile}
      />
    </div>
  );
};

export default JobProfiles;