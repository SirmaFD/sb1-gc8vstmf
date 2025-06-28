import React, { useState } from 'react';
import { X, Plus, Edit, Trash2, Building, Users, Save } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string;
  manager: string;
  employeeCount: number;
  isActive: boolean;
  createdAt: Date;
}

interface DepartmentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDepartments: (departments: Department[]) => void;
  initialDepartments?: Department[];
}

const DepartmentManagementModal: React.FC<DepartmentManagementModalProps> = ({
  isOpen,
  onClose,
  onSaveDepartments,
  initialDepartments = []
}) => {
  const [departments, setDepartments] = useState<Department[]>(
    initialDepartments.length > 0 ? initialDepartments : [
      {
        id: 'dept1',
        name: 'Engineering',
        description: 'Software development and technical operations',
        manager: 'John Smith',
        employeeCount: 25,
        isActive: true,
        createdAt: new Date('2023-01-01')
      },
      {
        id: 'dept2',
        name: 'Design',
        description: 'User experience and visual design',
        manager: 'Sarah Johnson',
        employeeCount: 8,
        isActive: true,
        createdAt: new Date('2023-01-01')
      },
      {
        id: 'dept3',
        name: 'Product',
        description: 'Product strategy and management',
        manager: 'Mike Wilson',
        employeeCount: 12,
        isActive: true,
        createdAt: new Date('2023-01-01')
      },
      {
        id: 'dept4',
        name: 'Marketing',
        description: 'Brand marketing and customer acquisition',
        manager: 'Lisa Chen',
        employeeCount: 15,
        isActive: true,
        createdAt: new Date('2023-01-01')
      },
      {
        id: 'dept5',
        name: 'Sales',
        description: 'Revenue generation and client relationships',
        manager: 'David Brown',
        employeeCount: 18,
        isActive: true,
        createdAt: new Date('2023-01-01')
      },
      {
        id: 'dept6',
        name: 'Human Resources',
        description: 'People operations and talent management',
        manager: 'Emma Davis',
        employeeCount: 6,
        isActive: true,
        createdAt: new Date('2023-01-01')
      },
      {
        id: 'dept7',
        name: 'Finance',
        description: 'Financial planning and accounting',
        manager: 'Robert Taylor',
        employeeCount: 10,
        isActive: true,
        createdAt: new Date('2023-01-01')
      }
    ]
  );

  const [editingDepartment, setEditingDepartment] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    manager: ''
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveDepartments(departments);
    onClose();
  };

  const handleAddDepartment = () => {
    if (newDepartment.name.trim() === '') return;

    const department: Department = {
      id: `dept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newDepartment.name,
      description: newDepartment.description,
      manager: newDepartment.manager,
      employeeCount: 0,
      isActive: true,
      createdAt: new Date()
    };

    setDepartments([...departments, department]);
    setNewDepartment({ name: '', description: '', manager: '' });
    setShowAddForm(false);
  };

  const handleUpdateDepartment = (id: string, field: keyof Department, value: any) => {
    setDepartments(departments.map(dept => 
      dept.id === id ? { ...dept, [field]: value } : dept
    ));
  };

  const handleDeleteDepartment = (id: string) => {
    if (confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      setDepartments(departments.filter(dept => dept.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setDepartments(departments.map(dept => 
      dept.id === id ? { ...dept, isActive: !dept.isActive } : dept
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Building className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Department Management</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Organization Departments</h3>
              <p className="text-sm text-gray-600">Manage departments, assign managers, and track employee distribution</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </button>
          </div>

          {/* Add Department Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-md font-medium text-blue-900 mb-3">Add New Department</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Department name"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Department manager"
                  value={newDepartment.manager}
                  onChange={(e) => setNewDepartment({ ...newDepartment, manager: e.target.value })}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <button
                  onClick={handleAddDepartment}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Add Department
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewDepartment({ name: '', description: '', manager: '' });
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Departments Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map(department => (
                  <tr key={department.id} className={!department.isActive ? 'opacity-60' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingDepartment === department.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={department.name}
                            onChange={(e) => handleUpdateDepartment(department.id, 'name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                          />
                          <input
                            type="text"
                            value={department.description}
                            onChange={(e) => handleUpdateDepartment(department.id, 'description', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            placeholder="Description"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{department.name}</div>
                          <div className="text-sm text-gray-500">{department.description}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingDepartment === department.id ? (
                        <input
                          type="text"
                          value={department.manager}
                          onChange={(e) => handleUpdateDepartment(department.id, 'manager', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{department.manager}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{department.employeeCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(department.id)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          department.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition-colors`}
                      >
                        {department.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {department.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {editingDepartment === department.id ? (
                          <>
                            <button
                              onClick={() => setEditingDepartment(null)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingDepartment(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingDepartment(department.id)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDepartment(department.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Building className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Departments</p>
                  <p className="text-lg font-bold text-blue-700">{departments.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-900">Total Employees</p>
                  <p className="text-lg font-bold text-green-700">
                    {departments.reduce((sum, dept) => sum + dept.employeeCount, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Building className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Active Departments</p>
                  <p className="text-lg font-bold text-yellow-700">
                    {departments.filter(dept => dept.isActive).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Avg. Dept. Size</p>
                  <p className="text-lg font-bold text-purple-700">
                    {departments.length > 0 
                      ? Math.round(departments.reduce((sum, dept) => sum + dept.employeeCount, 0) / departments.length)
                      : 0
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagementModal;