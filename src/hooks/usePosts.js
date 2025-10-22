// ============================================================================
// src/hooks/usePosts.js - Posts Hook
// ============================================================================

import { useState, useCallback } from 'react';
import { apiClient } from '../services/api';

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getPosts(params);
      setPosts(data.results || data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (postData) => {
    try {
      setLoading(true);
      const newPost = await apiClient.createPost(postData);
      setPosts([newPost, ...posts]);
      return newPost;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [posts]);

  const likePost = useCallback(async (postId) => {
    try {
      await apiClient.likePost(postId);
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, likes_count: p.likes_count + 1, is_liked: true }
          : p
      ));
    } catch (err) {
      setError(err.message);
    }
  }, [posts]);

  const unlikePost = useCallback(async (postId) => {
    try {
      await apiClient.unlikePost(postId);
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, likes_count: p.likes_count - 1, is_liked: false }
          : p
      ));
    } catch (err) {
      setError(err.message);
    }
  }, [posts]);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    likePost,
    unlikePost,
  };
};