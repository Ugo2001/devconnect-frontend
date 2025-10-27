// ============================================================================
// src/pages/PostDetail.jsx - Post Detail Page with Comments
// ============================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, Trash2 } from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ReactMarkdown from 'react-markdown';

export const PostDetail = () => {
  //const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const { id } = useParams();  // Change from slug to id

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        // Extract ID from slug if needed, or use slug directly
        const data = await apiClient.get(`/posts/${id}/`);
        setPost(data);
        setComments(data.comments || []);
        setLiked(data.is_liked || false);
        setBookmarked(data.is_bookmarked || false);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleLike = async () => {
    try {
      if (liked) {
        await apiClient.unlikePost(post.id);
      } else {
        await apiClient.likePost(post.id);
      }
      setLiked(!liked);
      setPost({
        ...post,
        likes_count: post.likes_count + (liked ? -1 : 1),
      });
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        await apiClient.unbookmarkPost(post.id);
      } else {
        await apiClient.bookmarkPost(post.id);
      }
      setBookmarked(!bookmarked);
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const data = await apiClient.post('/posts/comments/', {
        post: post.id,
        content: commentText,
      });
      setComments([...comments, data]);
      setCommentText('');
      setPost({
        ...post,
        comments_count: post.comments_count + 1,
      });
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !post) {
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
          Error loading post: {error}
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
          Back to Feed
        </button>

        {/* Post Card */}
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <Link
                to={`users/${post.author.id}`}
                className="flex items-center gap-3 hover:opacity-80"
              >
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-bold">
                      {post.author.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {post.author.full_name || post.author.username}
                  </h3>
                  <p className="text-sm text-gray-500">@{post.author.username}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(post.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </Link>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => {
                  const tagName = typeof tag === 'string' ? tag : tag.name;
                  return (
                    <span
                      key={tagName}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                    >
                      #{tagName}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cover Image */}
          {post.cover_image && (
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          )}

          {/* Content */}
          <div className="p-6 prose prose-sm max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Stats */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-6 text-sm text-gray-600">
            <span>👁 {post.views_count} views</span>
            <span>💬 {post.comments_count} comments</span>
            <span>⏱ {post.reading_time}</span>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-200 flex gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                liked
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              {post.likes_count}
            </button>

            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                bookmarked
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
              Save
            </button>

            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6" id="comments">
            Comments ({post.comments_count})
          </h2>

          {/* Comment Form */}
          {user && (
            <form onSubmit={handleAddComment} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex gap-4 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold">
                      {user.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                    disabled={submittingComment}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={!commentText.trim() || submittingComment}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                    >
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      {comment.author.avatar ? (
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold">
                          {comment.author.username[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {comment.author.username}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700">{comment.content}</p>
                      <div className="mt-3 flex gap-4">
                        <button className="text-sm text-gray-600 hover:text-gray-900">
                          👍 {comment.likes_count}
                        </button>
                        <button className="text-sm text-gray-600 hover:text-gray-900">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};