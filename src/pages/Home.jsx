// ============================================================================
// src/pages/Home.jsx - Home/Feed Page
// ============================================================================

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, Eye, Search, Plus } from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { PostCard } from '../components/posts/PostCard';
import { CreatePostModal } from '../components/posts/CreatePostModal';


export const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('feed'); // feed, trending, search
  const { user } = useAuth();

  // Fetch feed/posts
  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab]);

   const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getPosts({ page });
      setPosts(prev =>
        page === 1 ? (Array.isArray(data) ? data : data.results || []) : [...prev, ...(Array.isArray(data) ? data : data.results || [])]
      );
      setHasMore(!!data.next);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  /*const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    setPosts([]); // Clear posts when starting new search
    setActiveTab('search');
  };*/

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setShowCreateModal(false);
  };

  const handleLike = async (postId, isLiked) => {
    try {
      // Optimistic update
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              is_liked: !isLiked,
              likes_count: post.likes_count + (isLiked ? -1 : 1),
            }
          : post
      ));

      // Make API call
      if (isLiked) {
        await apiClient.unlikePost(postId);
      } else {
        await apiClient.likePost(postId);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert on error
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              is_liked: isLiked,
              likes_count: post.likes_count + (isLiked ? 1 : -1),
            }
          : post
      ));
    }
  };

  const handleBookmark = async (postId, isBookmarked) => {
    try {
      // Optimistic update
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              is_bookmarked: !isBookmarked,
              bookmarks_count: (post.bookmarks_count || 0) + (isBookmarked ? -1 : 1),
            }
          : post
      ));

      // Make API call
      if (isBookmarked) {
        await apiClient.unbookmarkPost(postId);
      } else {
        await apiClient.bookmarkPost(postId);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      // Revert on error
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              is_bookmarked: isBookmarked,
              bookmarks_count: (post.bookmarks_count || 0) + (isBookmarked ? 1 : -1),
            }
          : post
      ));
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
 

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 flex gap-8">
            <button
              onClick={() => {
                setActiveTab('feed');
                setPage(1);
                setPosts([]);
              }}
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading State (initial) */}
        {loading && posts.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              {activeTab === 'search' ? 'No posts found.' : 'No posts yet.'}
            </p>
            {user && activeTab !== 'search' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create First Post
              </button>
            )}
          </div>
        ) : (
          /* Posts List */
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
                className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}

            {/* End Message */}
            {!hasMore && posts.length > 0 && (
              <p className="text-center text-gray-500 py-4">
                You've reached the end!
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;