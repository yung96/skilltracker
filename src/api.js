const API_BASE_URL = 'https://apiskilltracker.tw1.ru/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || 'Ошибка запроса');
    }

    return data;
  }

  // Auth
  async register(username, password, name, role) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, name, role }),
      skipAuth: !this.token,
    });
  }

  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      skipAuth: true,
    });
    this.setToken(data.access_token);
    return data;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  async createUser(username, password, name, role) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify({ username, password, name, role }),
    });
  }

  // Tasks
  async getTasks() {
    return this.request('/tasks');
  }

  async getTask(taskId) {
    return this.request(`/tasks/${taskId}`);
  }

  async createTask(employeeId, title, description, deadline, status, progress) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        employee_id: employeeId,
        title,
        description,
        deadline,
        status,
        progress,
      }),
    });
  }

  async updateTask(taskId, data) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateProgress(taskId, progress, status) {
    return this.request(`/tasks/${taskId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress, status }),
    });
  }

  async deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, { method: 'DELETE' });
  }

  // Comments
  async getComments(taskId) {
    return this.request(`/tasks/${taskId}/comments`);
  }

  async addComment(taskId, text) {
    return this.request(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // Attachments
  async getAttachments(taskId) {
    return this.request(`/tasks/${taskId}/attachments`);
  }

  async uploadAttachment(taskId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/attachments`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || 'Ошибка загрузки файла');
    }

    return response.json();
  }
}

export const api = new ApiClient();

