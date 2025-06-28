import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Shield, Calendar, Mail } from 'lucide-react';
import { UserRole } from '../types/auth';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!isOpen || !user) return null;

  const getRoleColor = (role: UserRole): string => {
    const colors = {
      [UserRole.ADMIN]: 'bg-red-100 text-red-800',
      [UserRole.HR_MANAGER]: 'bg-purple-100 text-purple-800',
      [UserRole.DEPARTMENT_MANAGER]: 'bg-blue-100 text-blue-800',
      [UserRole.TEAM_LEAD]: 'bg-green-100 text-green-800',
      [UserRole.ASSESSOR]: 'bg-yellow-100 text-yellow-800',
      [UserRole.EMPLOYEE]: 'bg-gray-100 text-gray-800'
    };
    return colors[role];
  };

  const getRoleDisplayName = (role: UserRole): string => {
    const names = {
      [UserRole.ADMIN]: 'System Administrator',
      [UserRole.HR_MANAGER]: 'HR Manager',
      [UserRole.DEPARTMENT_MANAGER]: 'Department Manager',
      [UserRole.TEAM_LEAD]: 'Team Lead',
      [UserRole.ASSESSOR]: 'Assessor',
      [UserRole.EMPLOYEE]: 'Employee'
    };
    return names[role];
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-slide-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">User Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-3" />
                {user.email}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 mr-3" />
                {user.department}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-3" />
                Member since {user.createdAt.toLocaleDateString()}
              </div>

              {user.lastLogin && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-3" />
                  Last login: {user.lastLogin.toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Permissions */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
              <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
                <div className="grid grid-cols-1 gap-1">
                  {user.permissions.map((permission, index) => (
                    <span key={index} className="text-xs text-gray-600">
                      • {permission.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;