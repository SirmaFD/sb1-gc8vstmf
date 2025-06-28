import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Permission, UserRole } from '../types/auth';
import { mockUsers, rolePermissions } from '../data/authData';
import DepartmentManagementModal from './DepartmentManagementModal';
import { 
  Settings, 
  Users, 
  Shield, 
  Database, 
  Bell, 
  Mail,
  Lock,
  Save,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Building
} from 'lucide-react';

interface SystemConfig {
  organizationName: string;
  assessmentFrequency: number; // months
  skillLevels: string[];
  emailNotifications: boolean;
  autoAssignments: boolean;
  dataRetention: number; // years
}

interface Department {
  id: string;
  name: string;
  description: string;
  manager: string;
  employeeCount: number;
  isActive: boolean;
  createdAt: Date;
}

const SystemSettings: React.FC = () => {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [config, setConfig] = useState<SystemConfig>({
    organizationName: 'SkillHarbor Enterprise',
    assessmentFrequency: 6,
    skillLevels: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'],
    emailNotifications: true,
    autoAssignments: false,
    dataRetention: 7
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'departments', label: 'Departments', icon: Building },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Security', icon: Database }
  ];

  if (!hasPermission(Permission.SYSTEM_CONFIGURATION)) {
    return (
      <div className="text-center py-12">
        <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">You don't have permission to access system settings.</p>
      </div>
    );
  }

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Saving configuration:', config);
    alert('Settings saved successfully!');
  };

  const handleSaveDepartments = (updatedDepartments: Department[]) => {
    setDepartments(updatedDepartments);
    console.log('Saving departments:', updatedDepartments);
    alert('Departments updated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-3" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={config.organizationName}
                    onChange={(e) => setConfig({ ...config, organizationName: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessment Frequency (months)
                  </label>
                  <select
                    value={config.assessmentFrequency}
                    onChange={(e) => setConfig({ ...config, assessmentFrequency: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={3}>Every 3 months</option>
                    <option value={6}>Every 6 months</option>
                    <option value={12}>Every 12 months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill Levels
                  </label>
                  <div className="space-y-2">
                    {config.skillLevels.map((level, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={level}
                          onChange={(e) => {
                            const newLevels = [...config.skillLevels];
                            newLevels[index] = e.target.value;
                            setConfig({ ...config, skillLevels: newLevels });
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button className="flex items-center text-primary-600 hover:text-primary-700">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Level
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoAssignments"
                    checked={config.autoAssignments}
                    onChange={(e) => setConfig({ ...config, autoAssignments: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoAssignments" className="ml-2 text-sm text-gray-700">
                    Enable automatic skill assignments based on job profiles
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'departments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Department Management</h3>
                    <p className="text-sm text-gray-600 mt-1">Organize your workforce into departments and assign managers</p>
                  </div>
                  <button
                    onClick={() => setShowDepartmentModal(true)}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Manage Departments
                  </button>
                </div>

                {/* Department Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Building className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Total Departments</p>
                        <p className="text-lg font-bold text-blue-700">{departments.length || 7}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Active Departments</p>
                        <p className="text-lg font-bold text-green-700">
                          {departments.filter(d => d.isActive).length || 7}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-purple-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-purple-900">Total Employees</p>
                        <p className="text-lg font-bold text-purple-700">
                          {departments.reduce((sum, dept) => sum + dept.employeeCount, 0) || 94}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Department List */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Current Departments</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(departments.length > 0 ? departments : [
                      { name: 'Engineering', manager: 'John Smith', employeeCount: 25, isActive: true },
                      { name: 'Design', manager: 'Sarah Johnson', employeeCount: 8, isActive: true },
                      { name: 'Product', manager: 'Mike Wilson', employeeCount: 12, isActive: true },
                      { name: 'Marketing', manager: 'Lisa Chen', employeeCount: 15, isActive: true },
                      { name: 'Sales', manager: 'David Brown', employeeCount: 18, isActive: true },
                      { name: 'Human Resources', manager: 'Emma Davis', employeeCount: 6, isActive: true },
                      { name: 'Finance', manager: 'Robert Taylor', employeeCount: 10, isActive: true }
                    ]).map((dept, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md">
                        <div>
                          <p className="font-medium text-gray-900">{dept.name}</p>
                          <p className="text-sm text-gray-600">{dept.manager} • {dept.employeeCount} employees</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {dept.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Department Management</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Use the Department Management modal to add, edit, or remove departments. 
                        Changes will affect job profiles, employee assignments, and reporting structures.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockUsers.map(user => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{user.role}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{user.department}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-primary-600 hover:text-primary-900 mr-3">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Role Permissions</h3>
                
                <div className="space-y-4">
                  {rolePermissions.map(roleConfig => (
                    <div key={roleConfig.role} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{roleConfig.role.toUpperCase()}</h4>
                          <p className="text-sm text-gray-600">{roleConfig.description}</p>
                        </div>
                        <button className="text-primary-600 hover:text-primary-700">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {roleConfig.permissions.map(permission => (
                          <span key={permission} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {permission.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Send email notifications for assessments and updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.emailNotifications}
                      onChange={(e) => setConfig({ ...config, emailNotifications: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Email Templates</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Assessment Due Reminder</span>
                        <button className="text-primary-600 hover:text-primary-700">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Skill Gap Alert</span>
                        <button className="text-primary-600 hover:text-primary-700">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Certification Expiry</span>
                        <button className="text-primary-600 hover:text-primary-700">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Data & Security</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Retention Period (years)
                  </label>
                  <select
                    value={config.dataRetention}
                    onChange={(e) => setConfig({ ...config, dataRetention: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={3}>3 years</option>
                    <option value={5}>5 years</option>
                    <option value={7}>7 years</option>
                    <option value={10}>10 years</option>
                  </select>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Data Export</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Export all organizational data for backup or migration purposes.
                      </p>
                      <button className="mt-2 text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-200">
                        Export Data
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Danger Zone</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Permanently delete all data. This action cannot be undone.
                      </p>
                      <button className="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200">
                        Delete All Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Department Management Modal */}
      <DepartmentManagementModal
        isOpen={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        onSaveDepartments={handleSaveDepartments}
        initialDepartments={departments}
      />
    </div>
  );
};

export default SystemSettings;