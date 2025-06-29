import React, { useState } from 'react';
import { 
  BarChart3, 
  User, 
  Settings, 
  Users, 
  Briefcase, 
  ClipboardCheck, 
  ChevronDown,
  TrendingDown,
  FileText,
  BookOpen,
  Cog,
  LogOut,
  Menu,
  X,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types/auth';
import UserProfile from './UserProfile';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { user, hasPermission, canAccessResource, logout } = useAuth();
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3,
      resource: 'dashboard',
      action: 'view'
    },
    { 
      id: 'skills', 
      label: 'My Skills', 
      icon: User,
      resource: 'skills',
      action: 'view'
    },
    { 
      id: 'organization', 
      label: 'Organization', 
      icon: Users,
      resource: 'organization',
      action: 'view'
    },
    { 
      id: 'employees', 
      label: 'Employees', 
      icon: Users,
      resource: 'employees',
      action: 'view'
    },
    { 
      id: 'performance', 
      label: 'Performance', 
      icon: Award,
      requiredPermissions: [Permission.EDIT_EMPLOYEE_PROFILES, Permission.CONDUCT_ASSESSMENTS]
    },
    { 
      id: 'job-profiles', 
      label: 'Job Profiles', 
      icon: Briefcase,
      resource: 'job-profiles',
      action: 'view'
    },
    { 
      id: 'assessments', 
      label: 'Assessments', 
      icon: ClipboardCheck,
      resource: 'assessments',
      action: 'view'
    },
    { 
      id: 'skill-gaps', 
      label: 'Skill Gaps', 
      icon: TrendingDown,
      requiredPermissions: [Permission.VIEW_ORGANIZATION_DASHBOARD]
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: FileText,
      requiredPermissions: [Permission.VIEW_ORGANIZATION_DASHBOARD]
    },
    { 
      id: 'learning-paths', 
      label: 'Learning', 
      icon: BookOpen,
      resource: 'learning-paths',
      action: 'view'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Cog,
      requiredPermissions: [Permission.SYSTEM_CONFIGURATION]
    }
  ];

  const visibleTabs = tabs.filter(tab => {
    if (tab.requiredPermissions) {
      return tab.requiredPermissions.some(permission => hasPermission(permission));
    }
    if (tab.resource && tab.action) {
      return canAccessResource(tab.resource, tab.action);
    }
    return true;
  });

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const handleTabChange = (tabId: string) => {
    console.log('Header: Changing tab to:', tabId); // Debug log
    onTabChange(tabId);
    setShowMobileMenu(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl sm:text-2xl font-bold text-primary-600">SkillHarbor</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Enterprise Skills Management</p>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:ml-10 lg:block">
                <div className="flex space-x-1">
                  {visibleTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'text-primary-600 bg-primary-50 border border-primary-200'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </nav>
            </div>
            
            {/* Right side */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Settings button - Desktop only */}
              {hasPermission(Permission.SYSTEM_CONFIGURATION) && (
                <button 
                  onClick={() => handleTabChange('settings')}
                  className={`hidden sm:block p-2 rounded-md transition-colors ${
                    activeTab === 'settings' 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                  title="System Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-gray-50"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium hidden sm:block max-w-32 truncate">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 hidden sm:block" />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setShowUserProfile(true);
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        View Profile
                      </button>
                      
                      {/* Settings in mobile user menu */}
                      {hasPermission(Permission.SYSTEM_CONFIGURATION) && (
                        <button
                          onClick={() => {
                            handleTabChange('settings');
                            setShowUserMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors sm:hidden"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </button>
                      )}
                      
                      <div className="border-t border-gray-100"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="lg:hidden border-t border-gray-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1 max-h-96 overflow-y-auto">
                {visibleTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-primary-600 bg-primary-50 border border-primary-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Click outside to close menus */}
        {(showUserMenu || showMobileMenu) && (
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => {
              setShowUserMenu(false);
              setShowMobileMenu(false);
            }}
          ></div>
        )}
      </header>

      <UserProfile 
        isOpen={showUserProfile} 
        onClose={() => setShowUserProfile(false)} 
      />
    </>
  );
};

export default Header;