import React, { useState } from 'react';
import { Employee, SkillLevel } from '../types';
import { Search, Filter, User, Mail, Calendar, Award } from 'lucide-react';

interface EmployeeListProps {
  employees: Employee[];
  onEmployeeSelect: (employee: Employee) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onEmployeeSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const departments = Array.from(new Set(employees.map(emp => emp.department)));

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const getAverageSkillLevel = (employee: Employee): number => {
    if (employee.skills.length === 0) return 0;
    return employee.skills.reduce((sum, skill) => sum + skill.level, 0) / employee.skills.length;
  };

  const getSkillLevelText = (level: number): string => {
    if (level >= 4.5) return 'Expert';
    if (level >= 3.5) return 'Advanced';
    if (level >= 2.5) return 'Intermediate';
    if (level >= 1.5) return 'Developing';
    return 'Beginner';
  };

  const getSkillLevelColor = (level: number): string => {
    if (level >= 4.5) return 'bg-purple-100 text-purple-800';
    if (level >= 3.5) return 'bg-green-100 text-green-800';
    if (level >= 2.5) return 'bg-blue-100 text-blue-800';
    if (level >= 1.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(employee => {
          const avgSkillLevel = getAverageSkillLevel(employee);
          const daysSinceAssessment = employee.lastAssessment ? 
            Math.floor((new Date().getTime() - employee.lastAssessment.getTime()) / (1000 * 60 * 60 * 24)) : 
            null;

          return (
            <div
              key={employee.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-primary-300 animate-fade-in"
              onClick={() => onEmployeeSelect(employee)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                      <p className="text-sm text-gray-600">{employee.role}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {employee.email}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Department</span>
                    <span className="text-sm font-medium text-gray-900">{employee.department}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Skills</span>
                    <span className="text-sm font-medium text-gray-900">{employee.skills.length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Level</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(avgSkillLevel)}`}>
                      {getSkillLevelText(avgSkillLevel)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Certifications</span>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{employee.certifications.length}</span>
                    </div>
                  </div>

                  {daysSinceAssessment !== null && (
                    <div className="flex items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <Calendar className="w-3 h-3 mr-1" />
                      Last assessed {daysSinceAssessment} days ago
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No employees found matching your criteria</p>
          <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;