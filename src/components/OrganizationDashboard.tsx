import React from 'react';
import { Employee, OrganizationMetrics, SkillLevel } from '../types';
import { Users, Target, AlertTriangle, Award, TrendingUp, Calendar } from 'lucide-react';

interface OrganizationDashboardProps {
  employees: Employee[];
}

const OrganizationDashboard: React.FC<OrganizationDashboardProps> = ({ employees }) => {
  const getOrganizationMetrics = (): OrganizationMetrics => {
    const allSkills = employees.flatMap(emp => emp.skills);
    const totalSkills = allSkills.length;
    const averageLevel = totalSkills > 0 ? 
      allSkills.reduce((sum, skill) => sum + skill.level, 0) / totalSkills : 0;
    
    const skillGaps = allSkills.filter(skill => skill.level < skill.targetLevel).length;
    
    const expiringCerts = employees.flatMap(emp => emp.certifications)
      .filter(cert => {
        if (!cert.expiryDate) return false;
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return cert.expiryDate <= thirtyDaysFromNow;
      }).length;

    const assessmentsDue = employees.filter(emp => {
      if (!emp.lastAssessment) return true;
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return emp.lastAssessment < sixMonthsAgo;
    }).length;

    return {
      totalEmployees: employees.length,
      skillsTracked: new Set(allSkills.map(s => s.id)).size,
      averageSkillLevel: averageLevel,
      skillGaps,
      certificationsExpiring: expiringCerts,
      assessmentsDue
    };
  };

  const getDepartmentBreakdown = () => {
    const departments = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(departments).map(([dept, count]) => ({
      department: dept,
      count,
      percentage: (count / employees.length) * 100
    }));
  };

  const getSkillLevelDistribution = () => {
    const allSkills = employees.flatMap(emp => emp.skills);
    const distribution = Object.values(SkillLevel)
      .filter(v => typeof v === 'number')
      .map(level => {
        const count = allSkills.filter(skill => skill.level === level).length;
        return {
          level: level as SkillLevel,
          count,
          percentage: allSkills.length > 0 ? (count / allSkills.length) * 100 : 0
        };
      });
    
    return distribution;
  };

  const metrics = getOrganizationMetrics();
  const departmentBreakdown = getDepartmentBreakdown();
  const skillDistribution = getSkillLevelDistribution();

  const statCards = [
    {
      title: 'Total Employees',
      value: metrics.totalEmployees,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Skills Tracked',
      value: metrics.skillsTracked,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Skill Gaps',
      value: metrics.skillGaps,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Avg. Skill Level',
      value: metrics.averageSkillLevel.toFixed(1),
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Expiring Certs',
      value: metrics.certificationsExpiring,
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Assessments Due',
      value: metrics.assessmentsDue,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  const levelNames = {
    [SkillLevel.BEGINNER]: 'Beginner',
    [SkillLevel.INTERMEDIATE]: 'Intermediate',
    [SkillLevel.ADVANCED]: 'Advanced',
    [SkillLevel.EXPERT]: 'Expert',
    [SkillLevel.MASTER]: 'Master'
  };

  const levelColors = {
    [SkillLevel.BEGINNER]: 'bg-red-500',
    [SkillLevel.INTERMEDIATE]: 'bg-yellow-500',
    [SkillLevel.ADVANCED]: 'bg-blue-500',
    [SkillLevel.EXPERT]: 'bg-green-500',
    [SkillLevel.MASTER]: 'bg-purple-500'
  };

  return (
    <div className="space-y-6">
      {/* Organization Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-fade-in">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">{stat.title}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Breakdown</h3>
          <div className="space-y-4">
            {departmentBreakdown.map((dept, index) => (
              <div key={index} className="flex items-center">
                <div className="w-24 text-sm text-gray-600">{dept.department}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary-500 transition-all duration-500"
                      style={{ width: `${dept.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-900 font-medium">{dept.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Level Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Skill Distribution</h3>
          <div className="space-y-4">
            {skillDistribution.map((dist) => (
              <div key={dist.level} className="flex items-center">
                <div className="w-24 text-sm text-gray-600">
                  {levelNames[dist.level]}
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${levelColors[dist.level]}`}
                      style={{ width: `${dist.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-900 font-medium">{dist.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employees Needing Assessment</h3>
          <div className="space-y-3">
            {employees
              .filter(emp => {
                if (!emp.lastAssessment) return true;
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                return emp.lastAssessment < sixMonthsAgo;
              })
              .slice(0, 5)
              .map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-600">{employee.department} • {employee.role}</p>
                  </div>
                  <div className="text-sm text-yellow-700">
                    {employee.lastAssessment ? 
                      `${Math.floor((new Date().getTime() - employee.lastAssessment.getTime()) / (1000 * 60 * 60 * 24))} days ago` :
                      'Never assessed'
                    }
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expiring Certifications</h3>
          <div className="space-y-3">
            {employees
              .flatMap(emp => 
                emp.certifications
                  .filter(cert => {
                    if (!cert.expiryDate) return false;
                    const thirtyDaysFromNow = new Date();
                    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                    return cert.expiryDate <= thirtyDaysFromNow;
                  })
                  .map(cert => ({ ...cert, employeeName: emp.name }))
              )
              .slice(0, 5)
              .map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{cert.name}</p>
                    <p className="text-sm text-gray-600">{cert.employeeName}</p>
                  </div>
                  <div className="text-sm text-red-700">
                    Expires {cert.expiryDate?.toLocaleDateString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboard;