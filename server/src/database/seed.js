const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDatabase, initializeDatabase } = require('./connection');

const seedDatabase = async () => {
  try {
    await initializeDatabase();
    const db = getDatabase();

    console.log('🌱 Starting database seeding...');

    // Clear existing data
    const tables = [
      'refresh_tokens', 'user_learning_progress', 'learning_modules', 'learning_paths',
      'qualifications', 'certifications', 'assessments', 'job_profile_skills', 
      'job_profiles', 'employee_skills', 'skills', 'users', 'departments'
    ];

    for (const table of tables) {
      await new Promise((resolve, reject) => {
        db.run(`DELETE FROM ${table}`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Seed departments
    const departments = [
      { id: uuidv4(), name: 'Engineering', description: 'Software development and technical operations' },
      { id: uuidv4(), name: 'Design', description: 'User experience and visual design' },
      { id: uuidv4(), name: 'Product', description: 'Product strategy and management' },
      { id: uuidv4(), name: 'Marketing', description: 'Brand marketing and customer acquisition' },
      { id: uuidv4(), name: 'Sales', description: 'Revenue generation and client relationships' },
      { id: uuidv4(), name: 'Human Resources', description: 'People operations and talent management' },
      { id: uuidv4(), name: 'Finance', description: 'Financial planning and accounting' }
    ];

    for (const dept of departments) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO departments (id, name, description) VALUES (?, ?, ?)',
          [dept.id, dept.name, dept.description],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Seed users
    const passwordHash = await bcrypt.hash('password123', 12);
    const users = [
      {
        id: uuidv4(),
        email: 'admin@skillharbor.com',
        name: 'System Administrator',
        role: 'admin',
        departmentId: departments.find(d => d.name === 'Engineering').id
      },
      {
        id: uuidv4(),
        email: 'hr.manager@skillharbor.com',
        name: 'HR Manager',
        role: 'hr_manager',
        departmentId: departments.find(d => d.name === 'Human Resources').id
      },
      {
        id: uuidv4(),
        email: 'john.smith@skillharbor.com',
        name: 'John Smith',
        role: 'team_lead',
        departmentId: departments.find(d => d.name === 'Engineering').id
      },
      {
        id: uuidv4(),
        email: 'sarah.johnson@skillharbor.com',
        name: 'Sarah Johnson',
        role: 'employee',
        departmentId: departments.find(d => d.name === 'Design').id
      },
      {
        id: uuidv4(),
        email: 'mike.wilson@skillharbor.com',
        name: 'Mike Wilson',
        role: 'department_manager',
        departmentId: departments.find(d => d.name === 'Product').id
      }
    ];

    for (const user of users) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (id, email, password_hash, name, role, department_id) VALUES (?, ?, ?, ?, ?, ?)',
          [user.id, user.email, passwordHash, user.name, user.role, user.departmentId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Update department managers
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE departments SET manager_id = ? WHERE name = ?',
        [users.find(u => u.name === 'HR Manager').id, 'Human Resources'],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE departments SET manager_id = ? WHERE name = ?',
        [users.find(u => u.name === 'Mike Wilson').id, 'Product'],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Seed skills
    const skills = [
      { id: uuidv4(), name: 'React Development', category: 'technical', description: 'Building modern web applications with React' },
      { id: uuidv4(), name: 'TypeScript', category: 'technical', description: 'Type-safe JavaScript development' },
      { id: uuidv4(), name: 'Node.js', category: 'technical', description: 'Server-side JavaScript development' },
      { id: uuidv4(), name: 'Team Leadership', category: 'soft', description: 'Leading and mentoring development teams' },
      { id: uuidv4(), name: 'UI/UX Design', category: 'design', description: 'User interface and experience design' },
      { id: uuidv4(), name: 'Project Management', category: 'business', description: 'Planning and executing software projects' },
      { id: uuidv4(), name: 'Python', category: 'technical', description: 'Python programming and development' },
      { id: uuidv4(), name: 'Data Analysis', category: 'technical', description: 'Analyzing and interpreting data' },
      { id: uuidv4(), name: 'Communication', category: 'soft', description: 'Effective verbal and written communication' },
      { id: uuidv4(), name: 'Problem Solving', category: 'soft', description: 'Analytical thinking and problem resolution' }
    ];

    for (const skill of skills) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO skills (id, name, category, description) VALUES (?, ?, ?, ?)',
          [skill.id, skill.name, skill.category, skill.description],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Seed employee skills
    const johnSmith = users.find(u => u.name === 'John Smith');
    const sarahJohnson = users.find(u => u.name === 'Sarah Johnson');
    
    const employeeSkills = [
      // John Smith skills
      {
        id: uuidv4(),
        userId: johnSmith.id,
        skillId: skills.find(s => s.name === 'React Development').id,
        currentLevel: 4,
        targetLevel: 5,
        priority: 'high'
      },
      {
        id: uuidv4(),
        userId: johnSmith.id,
        skillId: skills.find(s => s.name === 'TypeScript').id,
        currentLevel: 3,
        targetLevel: 4,
        priority: 'medium'
      },
      {
        id: uuidv4(),
        userId: johnSmith.id,
        skillId: skills.find(s => s.name === 'Team Leadership').id,
        currentLevel: 3,
        targetLevel: 4,
        priority: 'high'
      },
      // Sarah Johnson skills
      {
        id: uuidv4(),
        userId: sarahJohnson.id,
        skillId: skills.find(s => s.name === 'UI/UX Design').id,
        currentLevel: 4,
        targetLevel: 5,
        priority: 'high'
      },
      {
        id: uuidv4(),
        userId: sarahJohnson.id,
        skillId: skills.find(s => s.name === 'Communication').id,
        currentLevel: 4,
        targetLevel: 4,
        priority: 'medium'
      }
    ];

    for (const empSkill of employeeSkills) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO employee_skills (id, user_id, skill_id, current_level, target_level, priority, last_assessed) 
           VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [empSkill.id, empSkill.userId, empSkill.skillId, empSkill.currentLevel, empSkill.targetLevel, empSkill.priority],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Seed job profiles
    const jobProfiles = [
      {
        id: uuidv4(),
        title: 'Senior React Developer',
        departmentId: departments.find(d => d.name === 'Engineering').id,
        level: 'senior',
        description: 'Lead React development initiatives and mentor junior developers',
        responsibilities: JSON.stringify([
          'Develop complex React applications',
          'Code review and mentoring',
          'Architecture decisions',
          'Performance optimization'
        ])
      },
      {
        id: uuidv4(),
        title: 'UX Designer',
        departmentId: departments.find(d => d.name === 'Design').id,
        level: 'mid',
        description: 'Create user-centered designs for web and mobile applications',
        responsibilities: JSON.stringify([
          'User research and analysis',
          'Wireframing and prototyping',
          'Design system maintenance',
          'Usability testing'
        ])
      }
    ];

    for (const profile of jobProfiles) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO job_profiles (id, title, department_id, level, description, responsibilities) VALUES (?, ?, ?, ?, ?, ?)',
          [profile.id, profile.title, profile.departmentId, profile.level, profile.description, profile.responsibilities],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Seed job profile skills
    const seniorReactProfile = jobProfiles.find(p => p.title === 'Senior React Developer');
    const uxDesignerProfile = jobProfiles.find(p => p.title === 'UX Designer');

    const jobProfileSkills = [
      // Senior React Developer required skills
      {
        id: uuidv4(),
        jobProfileId: seniorReactProfile.id,
        skillId: skills.find(s => s.name === 'React Development').id,
        minimumLevel: 4,
        weight: 10,
        isRequired: true
      },
      {
        id: uuidv4(),
        jobProfileId: seniorReactProfile.id,
        skillId: skills.find(s => s.name === 'TypeScript').id,
        minimumLevel: 3,
        weight: 8,
        isRequired: true
      },
      {
        id: uuidv4(),
        jobProfileId: seniorReactProfile.id,
        skillId: skills.find(s => s.name === 'Team Leadership').id,
        minimumLevel: 3,
        weight: 7,
        isRequired: false
      },
      // UX Designer required skills
      {
        id: uuidv4(),
        jobProfileId: uxDesignerProfile.id,
        skillId: skills.find(s => s.name === 'UI/UX Design').id,
        minimumLevel: 4,
        weight: 10,
        isRequired: true
      }
    ];

    for (const jpSkill of jobProfileSkills) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO job_profile_skills (id, job_profile_id, skill_id, minimum_level, weight, is_required) VALUES (?, ?, ?, ?, ?, ?)',
          [jpSkill.id, jpSkill.jobProfileId, jpSkill.skillId, jpSkill.minimumLevel, jpSkill.weight, jpSkill.isRequired],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('Admin: admin@skillharbor.com / password123');
    console.log('HR Manager: hr.manager@skillharbor.com / password123');
    console.log('Team Lead: john.smith@skillharbor.com / password123');
    console.log('Employee: sarah.johnson@skillharbor.com / password123');
    console.log('Dept Manager: mike.wilson@skillharbor.com / password123');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };