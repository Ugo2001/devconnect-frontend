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
    const data = await this.post('api/users/', userData);
    return data;
  }

  async logout() {
    this.clearTokens();
  }

  async getCurrentUser() {
    try {
      const res = await apiClient.get('api/users/me/');
      return res.data;
    } catch (err) {
      console.error('Error loading profile:', err);
      return null; // 👈 fallback
    }
  }

  // Users endpoints
  getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`api/users/?${query}`);
  }

  getUser(id) {
    return this.get(`api/users/${id}/`);
  }

  updateUser(id, data) {
    return this.patch(`api/users/${id}/`, data);
  }

  followUser(id) {
    return this.post(`api/users/${id}/follow/`, {});
  }

  unfollowUser(id) {
    return this.post(`api/users/${id}/unfollow/`, {});
  }

  getUserFollowers(id) {
    return this.get(`api/users/${id}/followers/`);
  }

  getUserFollowing(id) {
    return this.get(`api/users/${id}/following/`);
  }

  // Posts endpoints
  getPosts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`api/posts/?${query}`);
  }

  getPost(id) {
    return this.get(`api/posts/${id}/`);
  }

  createPost(data) {
    return this.post('api/posts/', data);
  }

  updatePost(id, data) {
    return this.patch(`api/posts/${id}/`, data);
  }

  deletePost(id) {
    return this.delete(`api/posts/${id}/`);
  }

  likePost(id) {
    return this.post(`api/posts/${id}/like/`, {});
  }

  unlikePost(id) {
    return this.post(`api/posts/${id}/unlike/`, {});
  }

  bookmarkPost(id) {
    return this.post(`api/posts/${id}/bookmark/`, {});
  }

  unbookmarkPost(id) {
    return this.post(`api/posts/${id}/unbookmark/`, {});
  }

  getPostFeed() {
    return this.get('api/posts/');
  }

  // Snippets endpoints
  getSnippets(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`api/snippets/?${query}`);
  }

  getSnippet(id) {
    return this.get(`api/snippets/${id}/`);
  }

  createSnippet(data) {
    return this.post('api/snippets/', data);
  }

  updateSnippet(id, data) {
    return this.patch(`api/snippets/${id}/`, data);
  }

  deleteSnippet(id) {
    return this.delete(`api/snippets/${id}/`);
  }

  likeSnippet(id) {
    return this.post(`api/snippets/${id}/like/`, {});
  }

  unlikeSnippet(id) {
    return this.post(`api/snippets/${id}/unlike/`, {});
  }

  forkSnippet(id) {
    return this.post(`api/snippets/${id}/fork/`, {});
  }

  getTrendingSnippets() {
    return this.get('api/snippets/trending/');
  }

  // Notifications endpoints
  getNotifications() {
    return this.get('api/notifications/');
  }

  getUnreadNotifications() {
    return this.get('api/notifications/unread/');
  }

  markNotificationRead(id) {
    return this.post(`api/notifications/${id}/mark_read/`, {});
  }

  markAllNotificationsRead() {
    return this.post('api/notifications/mark_all_read/', {});
  }
}

export const apiClient = new APIClient();

