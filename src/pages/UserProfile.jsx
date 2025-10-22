// ============================================================================
// src/pages/UserProfile.jsx - User Profile Page
// ============================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Globe, Github, Twitter, Mail, Users, FileText, Code, Trophy } from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { PostCard } from '../components/posts/PostCard';

export const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // posts, snippets, followers
  const [posts, setPosts] = useState([]);
  const [snippets, setSnippets] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await apiClient.getUser(id);
        setUser(userData);
        setIsFollowing(userData.is_following);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Fetch tab content
  useEffect(() => {
    const fetchTabContent = async () => {
      try {
        setTabLoading(true);
        if (activeTab === 'posts') {
          const data = await apiClient.getPosts({ author: user.username });
          setPosts(data.results || data || []);
        } else if (activeTab === 'snippets') {
          const data = await apiClient.getSnippets({ author: user.username });
          setSnippets(data.results || data || []);
        } else if (activeTab === 'followers') {
          const data = await apiClient.getUserFollowers(id);
          setFollowers(data.results || data || []);
        } else if (activeTab === 'following') {
          const data = await apiClient.getUserFollowing(id);
          setFollowing(data.results || data || []);
        }
      } catch (err) {
        console.error('Tab error:', err);
      } finally {
        setTabLoading(false);
      }
    };

    if (user) {
      fetchTabContent();
    }
  }, [activeTab, user, id]);

  const handleFollow = async () => {
    try {
      await apiClient.followUser(id);
      setIsFollowing(true);
      setUser({
        ...user,
        followers_count: user.followers_count + 1,
      });
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const handleUnfollow = async () => {
    try {
      await apiClient.unfollowUser(id);
      setIsFollowing(false);
      setUser({
        ...user,
        followers_count: user.followers_count - 1,
      });
    } catch (err) {
      console.error('Unfollow error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading profile: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400"></div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-16 mb-6">
              {/* Avatar */}
              <div className="flex items-end gap-4">
                <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white flex items-center justify-center flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-gray-600">
                      {user.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="pb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.full_name || user.username}
                  </h1>
                  <p className="text-gray-600">@{user.username}</p>
                </div>
              </div>

              {/* Follow Button */}
              {currentUser && currentUser.id !== user.id && (
                isFollowing ? (
                  <button
                    onClick={handleUnfollow}
                    className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Following
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Follow
                  </button>
                )
              )}
            </div>

            {/* Bio and Details */}
            {user.bio && (
              <p className="text-gray-700 mb-4">{user.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
              {user.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {user.location}
                </span>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              )}
              {user.github_username && (
                <a
                  href={`https://github.com/${user.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {user.twitter_handle && (
                <a
                  href={`https://twitter.com/${user.twitter_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
              )}
            </div>

            {/* Skills */}
            {user.profile && user.profile.skills && user.profile.skills.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{user.reputation}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <Trophy className="w-4 h-4" />
                  Reputation
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{user.posts_count}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <FileText className="w-4 h-4" />
                  Posts
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{user.snippets_count}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <Code className="w-4 h-4" />
                  Snippets
                </div>
              </div>
              <div className="text-center cursor-pointer hover:text-blue-600" onClick={() => setActiveTab('followers')}>
                <div className="text-2xl font-bold text-gray-900">{user.followers_count}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <Users className="w-4 h-4" />
                  Followers
                </div>
              </div>
              <div className="text-center cursor-pointer hover:text-blue-600" onClick={() => setActiveTab('following')}>
                <div className="text-2xl font-bold text-gray-900">{user.following_count}</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 mb-6">
          <div className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Posts
              </span>
            </button>
            <button
              onClick={() => setActiveTab('snippets')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'snippets'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Snippets
              </span>
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'followers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Followers
              </span>
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'following'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Following
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {tabLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activeTab === 'posts' ? (
            <div className="space-y-6">
              {posts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No posts yet</p>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={() => {}}
                    onBookmark={() => {}}
                  />
                ))
              )}
            </div>
          ) : activeTab === 'snippets' ? (
            <div className="space-y-4">
              {snippets.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No snippets yet</p>
              ) : (
                snippets.map((snippet) => (
                  <div key={snippet.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{snippet.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{snippet.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {snippet.language.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        ❤️ {snippet.likes_count}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'followers' ? (
            <div className="space-y-3">
              {followers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No followers yet</p>
              ) : (
                followers.map((follow) => (
                  <UserListItem key={follow.id} user={follow.follower} />
                ))
              )}
            </div>
          ) : activeTab === 'following' ? (
            <div className="space-y-3">
              {following.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Not following anyone yet</p>
              ) : (
                following.map((follow) => (
                  <UserListItem key={follow.id} user={follow.following} />
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
