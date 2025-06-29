// API service layer for backend communication
import { User, AuthState } from '../types/auth';
import { Skill, Employee, Assessment } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// API response types
interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    this.accessToken = localStorage.getItem('skillharbor_access_token');
    this.refreshToken = localStorage.getItem('skillharbor_refresh_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      // Handle token expiration
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the original request with new token
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${this.accessToken}`,
          };
          const retryResponse = await fetch(url, config);
          return this.handleResponse<T>(retryResponse);
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw new Error('Network error occurred');
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage = isJson ? data.error || data.message : data;
      throw new Error(errorMessage || `HTTP ${response.status}`);
    }

    return data;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.accessToken, this.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    // Clear invalid tokens
    this.clearTokens();
    return false;
  }

  private setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('skillharbor_access_token', accessToken);
    localStorage.setItem('skillharbor_refresh_token', refreshToken);
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('skillharbor_access_token');
    localStorage.removeItem('skillharbor_refresh_token');
    localStorage.removeItem('skillharbor_user');
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setTokens(response.accessToken, response.refreshToken);
    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    departmentId?: string;
  }): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.setTokens(response.accessToken, response.refreshToken);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  // Skills endpoints
  async getSkills(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<PaginatedResponse<Skill>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const endpoint = `/skills${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request<PaginatedResponse<Skill>>(endpoint);
  }

  async getSkill(id: string): Promise<{ skill: Skill }> {
    return this.request<{ skill: Skill }>(`/skills/${id}`);
  }

  async createSkill(skillData: Omit<Skill, 'id'>): Promise<{ skill: Skill }> {
    return this.request<{ skill: Skill }>('/skills', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  }

  async updateSkill(id: string, skillData: Partial<Skill>): Promise<{ skill: Skill }> {
    return this.request<{ skill: Skill }>(`/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skillData),
    });
  }

  async deleteSkill(id: string): Promise<void> {
    return this.request(`/skills/${id}`, {
      method: 'DELETE',
    });
  }

  // User skills endpoints
  async getUserSkills(userId: string): Promise<{ skills: Skill[] }> {
    return this.request<{ skills: Skill[] }>(`/skills/user/${userId}`);
  }

  async addUserSkill(userId: string, skillData: {
    skillId: string;
    currentLevel: number;
    targetLevel: number;
    priority: string;
    evidence?: string;
    developmentPlan?: string;
  }): Promise<{ skill: Skill }> {
    return this.request<{ skill: Skill }>(`/skills/user/${userId}`, {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  }

  async updateUserSkill(userId: string, skillId: string, skillData: {
    currentLevel: number;
    targetLevel: number;
    priority: string;
    evidence?: string;
    developmentPlan?: string;
  }): Promise<{ skill: Skill }> {
    return this.request<{ skill: Skill }>(`/skills/user/${userId}/${skillId}`, {
      method: 'PUT',
      body: JSON.stringify(skillData),
    });
  }

  async removeUserSkill(userId: string, skillId: string): Promise<void> {
    return this.request(`/skills/user/${userId}/${skillId}`, {
      method: 'DELETE',
    });
  }

  // Employees endpoints
  async getEmployees(params?: {
    page?: number;
    limit?: number;
    department?: string;
    search?: string;
  }): Promise<PaginatedResponse<Employee>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.department) queryParams.append('department', params.department);
    if (params?.search) queryParams.append('search', params.search);

    const endpoint = `/employees${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request<PaginatedResponse<Employee>>(endpoint);
  }

  async getEmployee(id: string): Promise<{ employee: Employee }> {
    return this.request<{ employee: Employee }>(`/employees/${id}`);
  }

  // Assessments endpoints
  async getAssessments(params?: {
    page?: number;
    limit?: number;
    employeeId?: string;
    skillId?: string;
  }): Promise<PaginatedResponse<Assessment>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.skillId) queryParams.append('skillId', params.skillId);

    const endpoint = `/assessments${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request<PaginatedResponse<Assessment>>(endpoint);
  }

  async createAssessment(assessmentData: {
    employeeId: string;
    skillId: string;
    newLevel: number;
    notes?: string;
    evidence?: string[];
    nextReviewDate?: string;
  }): Promise<{ assessment: Assessment }> {
    return this.request<{ assessment: Assessment }>('/assessments', {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
  }

  // Departments endpoints
  async getDepartments(): Promise<{ departments: any[] }> {
    return this.request<{ departments: any[] }>('/departments');
  }

  // Reports endpoints
  async getSkillsReport(): Promise<any> {
    return this.request('/reports/skills-distribution');
  }

  async getDepartmentStats(): Promise<any> {
    return this.request('/reports/department-stats');
  }

  async getSkillGaps(): Promise<any> {
    return this.request('/reports/skill-gaps');
  }

  async getPerformanceMetrics(): Promise<any> {
    return this.request('/reports/performance-metrics');
  }
}

export const apiService = new ApiService();
export default apiService;