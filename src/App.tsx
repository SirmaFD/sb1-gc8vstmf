import React, { useState } from 'react';
import { Skill, Employee } from './types';
import { mockSkills, mockEmployees } from './data/mockData';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Permission } from './types/auth';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SkillsList from './components/SkillsList';
import OrganizationDashboard from './components/OrganizationDashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeProfile from './components/EmployeeProfile';
import JobProfiles from './components/JobProfiles';
import AssessmentCenter from './components/AssessmentCenter';
import SkillGapAnalysis from './components/SkillGapAnalysis';
import ReportsAndAnalytics from './components/ReportsAndAnalytics';
import LearningPaths from './components/LearningPaths';
import SystemSettings from './components/SystemSettings';
import PerformanceManagementDashboard from './components/PerformanceManagementDashboard';
import LoginForm from './components/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [skills, setSkills] = useState<Skill[]>(mockSkills);
  const [employees] = useState<Employee[]>(mockEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { isAuthenticated, isLoading, user } = useAuth();

  const handleUpdateSkill = (updatedSkill: Skill) => {
    setSkills(prevSkills => {
      const existingSkillIndex = prevSkills.findIndex(skill => skill.id === updatedSkill.id);
      
      if (existingSkillIndex >= 0) {
        // Update existing skill
        return prevSkills.map(skill =>
          skill.id === updatedSkill.id ? updatedSkill : skill
        );
      } else {
        // Add new skill
        return [...prevSkills, updatedSkill];
      }
    });
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const handleCloseEmployeeProfile = () => {
    setSelectedEmployee(null);
  };

  const handleNavigate = (tab: string) => {
    console.log('Navigating to tab:', tab);
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    console.log('Rendering content for tab:', activeTab); // Debug log
    
    switch (activeTab) {
      case 'dashboard':
        return (
          <ProtectedRoute resource="dashboard" action="view">
            <Dashboard skills={skills} onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
        
      case 'skills':
        return (
          <ProtectedRoute resource="skills" action="view">
            <SkillsList skills={skills} onUpdateSkill={handleUpdateSkill} />
          </ProtectedRoute>
        );
        
      case 'organization':
        return (
          <ProtectedRoute resource="organization" action="view">
            <OrganizationDashboard employees={employees} />
          </ProtectedRoute>
        );
        
      case 'employees':
        return (
          <ProtectedRoute resource="employees" action="view">
            <EmployeeList employees={employees} onEmployeeSelect={handleEmployeeSelect} />
          </ProtectedRoute>
        );

      case 'performance':
        return (
          <ProtectedRoute requiredPermissions={[Permission.EDIT_EMPLOYEE_PROFILES, Permission.CONDUCT_ASSESSMENTS]}>
            <PerformanceManagementDashboard employees={employees} />
          </ProtectedRoute>
        );
        
      case 'job-profiles':
        return (
          <ProtectedRoute resource="job-profiles" action="view">
            <JobProfiles />
          </ProtectedRoute>
        );
        
      case 'assessments':
        return (
          <ProtectedRoute resource="assessments" action="view">
            <AssessmentCenter />
          </ProtectedRoute>
        );
        
      case 'skill-gaps':
        return (
          <ProtectedRoute requiredPermissions={[Permission.VIEW_ORGANIZATION_DASHBOARD]}>
            <SkillGapAnalysis />
          </ProtectedRoute>
        );
        
      case 'reports':
        return (
          <ProtectedRoute requiredPermissions={[Permission.VIEW_ORGANIZATION_DASHBOARD]}>
            <ReportsAndAnalytics />
          </ProtectedRoute>
        );
        
      case 'learning-paths':
        return (
          <ProtectedRoute resource="learning-paths" action="view">
            <LearningPaths />
          </ProtectedRoute>
        );
        
      case 'settings':
        return (
          <ProtectedRoute requiredPermissions={[Permission.SYSTEM_CONFIGURATION]}>
            <SystemSettings />
          </ProtectedRoute>
        );
        
      default:
        console.log('Default case triggered for tab:', activeTab); // Debug log
        return (
          <ProtectedRoute resource="dashboard" action="view">
            <Dashboard skills={skills} onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={handleNavigate} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Employee Profile Modal */}
      {selectedEmployee && (
        <ProtectedRoute 
          requiredPermissions={[
            Permission.VIEW_ALL_EMPLOYEES, 
            Permission.VIEW_TEAM_PROFILES, 
            Permission.VIEW_DEPARTMENT_PROFILES
          ]}
          allowSelfAccess={true}
        >
          <EmployeeProfile
            employee={selectedEmployee}
            isOpen={!!selectedEmployee}
            onClose={handleCloseEmployeeProfile}
          />
        </ProtectedRoute>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;