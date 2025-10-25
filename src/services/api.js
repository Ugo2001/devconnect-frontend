// ============================================================================
// src/services/api.js - API Service with JWT Token Management
// ============================================================================


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';


class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  // Get headers with authorization
  getHeaders(contentType = 'application/json') {
    const headers = {
      'Content-Type': contentType,
    };
    
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    
    return headers;
  }

  // Handle response
  async handleResponse(response) {
    const text = await response.text();
    
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error('Invalid JSON response:', text, e);
        throw new Error(`Server error: ${response.status} - ${text.substring(0, 200)} (${e.message})`);
    }
    
    if (!response.ok) {
        if (response.status === 401) {
        this.clearTokens();
        window.location.href = '/login';
        throw new Error('Unauthorized - please login again');
        }
        throw new Error(data.detail || data.message || `HTTP ${response.status}`);
    }
    
    return data;
  }
  // Store tokens
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  // Clear tokens
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Make request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders(options.contentType);
    
    const config = {
      method: options.method || 'GET',
      headers,
      ...options,
    };
    
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }
    
    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST
  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  // PATCH
  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body });
  }

  // DELETE
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Authentication endpoints
  async login(username, password) {
    const data = await this.post('api/token/', { username, password });
    this.setTokens(data.access, data.refresh);
    return data;
  }

  async register(userData) {
    const data = await this.post('users/', userData);
    return data;
  }

  async logout() {
    this.clearTokens();
  }

  async getCurrentUser() {
    return this.get('users/me/');
  }

  // Users endpoints
  getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`users/?${query}`);
  }

  getUser(id) {
    return this.get(`users/${id}/`);
  }

  updateUser(id, data) {
    return this.patch(`users/${id}/`, data);
  }

  followUser(id) {
    return this.post(`users/${id}/follow/`, {});
  }

  unfollowUser(id) {
    return this.post(`users/${id}/unfollow/`, {});
  }

  getUserFollowers(id) {
    return this.get(`users/${id}/followers/`);
  }

  getUserFollowing(id) {
    return this.get(`users/${id}/following/`);
  }

  // Posts endpoints
  getPosts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`posts/?${query}`);
  }

  getPost(id) {
    return this.get(`posts/${id}/`);
  }

  createPost(data) {
    return this.post('posts/', data);
  }

  updatePost(id, data) {
    return this.patch(`posts/${id}/`, data);
  }

  deletePost(id) {
    return this.delete(`posts/${id}/`);
  }

  likePost(id) {
    return this.post(`posts/${id}/like/`, {});
  }

  unlikePost(id) {
    return this.post(`posts/${id}/unlike/`, {});
  }

  bookmarkPost(id) {
    return this.post(`posts/${id}/bookmark/`, {});
  }

  unbookmarkPost(id) {
    return this.post(`posts/${id}/unbookmark/`, {});
  }

  getPostFeed() {
    return this.get('posts/');
  }

  // Snippets endpoints
  getSnippets(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`snippets/?${query}`);
  }

  getSnippet(id) {
    return this.get(`snippets/${id}/`);
  }

  createSnippet(data) {
    return this.post('snippets/', data);
  }

  updateSnippet(id, data) {
    return this.patch(`snippets/${id}/`, data);
  }

  deleteSnippet(id) {
    return this.delete(`snippets/${id}/`);
  }

  likeSnippet(id) {
    return this.post(`snippets/${id}/like/`, {});
  }

  unlikeSnippet(id) {
    return this.post(`snippets/${id}/unlike/`, {});
  }

  forkSnippet(id) {
    return this.post(`snippets/${id}/fork/`, {});
  }

  getTrendingSnippets() {
    return this.get('snippets/trending/');
  }

  // Notifications endpoints
  getNotifications() {
    return this.get('notifications/');
  }

  getUnreadNotifications() {
    return this.get('notifications/unread/');
  }

  markNotificationRead(id) {
    return this.post(`notifications/${id}/mark_read/`, {});
  }

  markAllNotificationsRead() {
    return this.post('notifications/mark_all_read/', {});
  }
}

export const apiClient = new APIClient();

