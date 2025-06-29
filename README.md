# SkillHarbor - Enterprise Skills Management Platform

A comprehensive skills management platform that helps organizations track, assess, and develop employee skills.

## 🚀 Features

- **Skills Management**: Track and manage individual and organizational skills
- **Performance Tracking**: Monitor employee performance and system engagement
- **Assessment Center**: Conduct skill assessments and self-evaluations
- **Learning Paths**: Structured learning journeys for skill development
- **Role-Based Access**: Granular permissions based on user roles
- **Analytics & Reporting**: Comprehensive insights into skills and performance

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Custom Hooks
- **API Layer**: Custom service layer with automatic token refresh
- **Authentication**: JWT-based with role-based access control

### Backend (Node.js + Express)
- **Framework**: Express.js with TypeScript
- **Database**: SQLite with comprehensive schema
- **Authentication**: JWT with refresh tokens
- **Security**: Helmet, CORS, rate limiting
- **API**: RESTful endpoints with validation

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Configuration

Create environment files:

```bash
# Frontend environment
cp .env.example .env

# Backend environment  
cp server/.env.example server/.env
```

Update the environment variables as needed.

### 3. Database Setup

```bash
# Initialize and seed the database
npm run server:seed
```

This creates the SQLite database with sample data including demo accounts.

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev:full

# Or start individually:
# Frontend only
npm run dev

# Backend only  
npm run server:dev
```

## 🔐 Demo Accounts

The system comes with pre-configured demo accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **System Admin** | admin@skillharbor.com | password123 | Full system access |
| **HR Manager** | hr.manager@skillharbor.com | password123 | Employee & performance management |
| **Team Lead** | john.smith@skillharbor.com | password123 | Team assessments & skills |
| **Employee** | sarah.johnson@skillharbor.com | password123 | Personal skills & assessments |
| **Dept Manager** | mike.wilson@skillharbor.com | password123 | Department oversight |

## 📡 API Integration

### Frontend-Backend Communication

The frontend communicates with the backend through:

1. **API Service Layer** (`src/services/api.ts`)
   - Centralized HTTP client
   - Automatic token refresh
   - Error handling
   - Type-safe endpoints

2. **Custom Hooks** (`src/hooks/useApi.ts`)
   - React hooks for API operations
   - Loading states and error handling
   - Automatic refetching

3. **Authentication Context** (`src/contexts/AuthContext.tsx`)
   - JWT token management
   - Role-based access control
   - Automatic session validation

### Key API Endpoints

```typescript
// Authentication
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

// Skills Management
GET    /api/skills
POST   /api/skills
GET    /api/skills/user/:userId
POST   /api/skills/user/:userId

// Employee Management
GET    /api/employees
GET    /api/employees/:id

// Assessments
GET    /api/assessments
POST   /api/assessments

// Reports & Analytics
GET    /api/reports/skills-distribution
GET    /api/reports/skill-gaps
```

## 🎯 User Roles & Permissions

### Role Hierarchy
1. **System Administrator** - Full system access
2. **HR Manager** - Organization-wide employee management
3. **Department Manager** - Department-level oversight
4. **Team Lead** - Team management and assessments
5. **Assessor** - Skill assessment capabilities
6. **Employee** - Personal skill management

### Permission System
- **Resource-based**: Controls access to features (skills, assessments, etc.)
- **Action-based**: Controls what actions can be performed (view, edit, delete)
- **Context-aware**: Considers user relationships (own data vs. others)

## 🔄 Development Workflow

### Frontend Development
```bash
# Start frontend dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development
```bash
# Start backend dev server
cd server && npm run dev

# Run database migrations
cd server && npm run migrate

# Seed database with sample data
cd server && npm run seed
```

### Full Stack Development
```bash
# Start both frontend and backend
npm run dev:full
```

## 📊 Performance Features

### System Engagement Tracking
- Login frequency and session duration
- Feature usage analytics
- Skill update frequency
- Assessment participation

### Performance Metrics
- Overall performance scores
- Skill development progress
- Learning engagement levels
- Goal achievement tracking

### Analytics Dashboard
- Organization-wide skill distribution
- Department performance comparison
- Skill gap analysis
- Trend reporting

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based access control** (RBAC)
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **CORS protection**
- **Helmet.js** security headers

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

### Backend Deployment
```bash
cd server
npm start
# Ensure environment variables are configured
```

### Environment Variables

**Frontend (.env)**
```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_NODE_ENV=development
```

**Backend (server/.env)**
```
NODE_ENV=production
PORT=3001
DATABASE_URL=./data/skillharbor.db
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review demo account capabilities
- Examine API endpoints in the server code
- Test with different user roles to understand permissions

---

**SkillHarbor** - Empowering organizations through strategic skills management.