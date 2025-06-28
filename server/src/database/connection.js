const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let db = null;

const getDatabasePath = () => {
  const dbPath = process.env.DATABASE_URL || './data/skillharbor.db';
  const dir = path.dirname(dbPath);
  
  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  return dbPath;
};

const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    const dbPath = getDatabasePath();
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      
      console.log('Connected to SQLite database');
      
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          console.error('Error enabling foreign keys:', err);
          reject(err);
          return;
        }
        
        // Create tables
        createTables()
          .then(() => resolve())
          .catch(reject);
      });
    });
  });
};

const createTables = async () => {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'hr_manager', 'department_manager', 'team_lead', 'employee', 'assessor')),
      department_id TEXT,
      is_active BOOLEAN DEFAULT 1,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id)
    )`,
    
    // Departments table
    `CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      manager_id TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES users(id)
    )`,
    
    // Skills table
    `CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Employee skills table (many-to-many relationship)
    `CREATE TABLE IF NOT EXISTS employee_skills (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      skill_id TEXT NOT NULL,
      current_level INTEGER NOT NULL CHECK (current_level BETWEEN 1 AND 5),
      target_level INTEGER NOT NULL CHECK (target_level BETWEEN 1 AND 5),
      priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
      last_assessed DATETIME,
      evidence TEXT,
      development_plan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
      UNIQUE(user_id, skill_id)
    )`,
    
    // Job profiles table
    `CREATE TABLE IF NOT EXISTS job_profiles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      department_id TEXT NOT NULL,
      level TEXT NOT NULL CHECK (level IN ('entry', 'junior', 'mid', 'senior', 'lead', 'principal')),
      description TEXT,
      responsibilities TEXT, -- JSON array
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id)
    )`,
    
    // Job profile skills (required and preferred skills for job profiles)
    `CREATE TABLE IF NOT EXISTS job_profile_skills (
      id TEXT PRIMARY KEY,
      job_profile_id TEXT NOT NULL,
      skill_id TEXT NOT NULL,
      minimum_level INTEGER NOT NULL CHECK (minimum_level BETWEEN 1 AND 5),
      weight INTEGER NOT NULL CHECK (weight BETWEEN 1 AND 10),
      is_required BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_profile_id) REFERENCES job_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
      UNIQUE(job_profile_id, skill_id)
    )`,
    
    // Assessments table
    `CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      assessor_id TEXT NOT NULL,
      skill_id TEXT NOT NULL,
      previous_level INTEGER CHECK (previous_level BETWEEN 1 AND 5),
      new_level INTEGER NOT NULL CHECK (new_level BETWEEN 1 AND 5),
      notes TEXT,
      evidence TEXT, -- JSON array
      next_review_date DATE,
      assessment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assessor_id) REFERENCES users(id),
      FOREIGN KEY (skill_id) REFERENCES skills(id)
    )`,
    
    // Certifications table
    `CREATE TABLE IF NOT EXISTS certifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      credential_id TEXT,
      date_obtained DATE NOT NULL,
      expiry_date DATE,
      is_verified BOOLEAN DEFAULT 0,
      skills_related TEXT, -- JSON array of skill IDs
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    // Qualifications table
    `CREATE TABLE IF NOT EXISTS qualifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      institution TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('degree', 'diploma', 'certificate', 'license')),
      date_obtained DATE NOT NULL,
      expiry_date DATE,
      is_verified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    // Learning paths table
    `CREATE TABLE IF NOT EXISTS learning_paths (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      target_skill_id TEXT,
      current_level INTEGER CHECK (current_level BETWEEN 1 AND 5),
      target_level INTEGER CHECK (target_level BETWEEN 1 AND 5),
      estimated_duration TEXT,
      difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
      is_active BOOLEAN DEFAULT 1,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (target_skill_id) REFERENCES skills(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,
    
    // Learning modules table
    `CREATE TABLE IF NOT EXISTS learning_modules (
      id TEXT PRIMARY KEY,
      learning_path_id TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('video', 'reading', 'exercise', 'assessment')),
      duration TEXT,
      is_required BOOLEAN DEFAULT 1,
      order_index INTEGER NOT NULL,
      content_url TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE
    )`,
    
    // User learning progress table
    `CREATE TABLE IF NOT EXISTS user_learning_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      learning_path_id TEXT NOT NULL,
      module_id TEXT NOT NULL,
      is_completed BOOLEAN DEFAULT 0,
      completion_date DATETIME,
      progress_percentage INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
      FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE,
      UNIQUE(user_id, module_id)
    )`,
    
    // Refresh tokens table
    `CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  for (const table of tables) {
    await new Promise((resolve, reject) => {
      db.run(table, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Create indexes for better performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id)',
    'CREATE INDEX IF NOT EXISTS idx_employee_skills_user ON employee_skills(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_employee_skills_skill ON employee_skills(skill_id)',
    'CREATE INDEX IF NOT EXISTS idx_assessments_employee ON assessments(employee_id)',
    'CREATE INDEX IF NOT EXISTS idx_assessments_date ON assessments(assessment_date)',
    'CREATE INDEX IF NOT EXISTS idx_certifications_user ON certifications(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_qualifications_user ON qualifications(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at)'
  ];

  for (const index of indexes) {
    await new Promise((resolve, reject) => {
      db.run(index, (err) => {
        if (err) {
          console.error('Error creating index:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  console.log('✅ Database tables and indexes created successfully');
};

const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase
};