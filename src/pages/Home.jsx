// ============================================================================
// src/pages/Home.jsx - Home/Feed Page
// ============================================================================

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, Eye, Search, Plus } from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { PostCard } from '../components/Posts/PostCard';
import { CreatePostModal } from '../components/Posts/CreatePostModal';
import { SearchBar } from '../components/SearchBar';

export const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('feed'); // feed, trending, search
  const { user } = useAuth();

  // Fetch feed/posts
  useEffect(() => {
    fetchPosts();
  }, [page, activeTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (activeTab === 'search' && searchQuery) {
        data = await apiClient.getPosts({ search: searchQuery, page });
        setPosts(page === 1 ? data.results || [] : [...posts, ...data.results] || []);
        setHasMore(!!data.next);
      } else {
        data = await apiClient.getPosts();
        setPosts(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    setActiveTab('search');
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreateModal(false);
  };

  const handleLike = (postId, isLiked) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
            ...post,
            is_liked: !isLiked,
            likes_count: post.likes_count + (isLiked ? -1 : 1),
          }
        : post
    ));
  };

  const handleBookmark = (postId, isBookmarked) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
            ...post,
            is_bookmarked: !isBookmarked,
            bookmarks_count: post.bookmarks_count + (isBookmarked ? -1 : 1),
          }
        : post
    ));
  };

  const handleLoadMore = () => {
    setPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 flex gap-8">
            <button
              onClick={() => setActiveTab('feed')}
              className={`py-3 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'feed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Feed
            </button>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Create Post Modal */}
        {showCreateModal && (
          <CreatePostModal
            onClose={() => setShowCreateModal(false)}
            onPostCreated={handlePostCreated}
          />
        )}

        {/* Posts List */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error loading posts: {error}
          </div>
        )}

        {loading && posts.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onBookmark={handleBookmark}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
