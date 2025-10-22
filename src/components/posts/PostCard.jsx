// ============================================================================
// src/components/Posts/PostCard.jsx - Individual Post Component
// ============================================================================

import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Eye, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/api';

export const PostCard = ({ post, onLike, onBookmark }) => {
  const [liked, setLiked] = useState(post.is_liked);
  const [bookmarked, setBookmarked] = useState(post.is_bookmarked);
  const [liking, setLiking] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  const handleLike = async () => {
    try {
      setLiking(true);
      if (liked) {
        await apiClient.unlikePost(post.id);
      } else {
        await apiClient.likePost(post.id);
      }
      setLiked(!liked);
      onLike(post.id, liked);
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setLiking(false);
    }
  };

  const handleBookmark = async () => {
    try {
      setBookmarking(true);
      if (bookmarked) {
        await apiClient.unbookmarkPost(post.id);
      } else {
        await apiClient.bookmarkPost(post.id);
      }
      setBookmarked(!bookmarked);
      onBookmark(post.id, bookmarked);
    } catch (error) {
      console.error('Bookmark error:', error);
    } finally {
      setBookmarking(false);
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <Link
            to={`/users/${post.author.id}`}
            className="flex items-center gap-3 hover:opacity-80"
          >
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
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
            </div>
          </Link>
          <time className="text-sm text-gray-500">
            {new Date(post.created_at).toLocaleDateString()}
          </time>
        </div>
      </div>

      {/* Content */}
      <Link to={`/posts/${post.id}`} className="block">
        <div className="px-4 pt-4 pb-2 hover:bg-gray-50 transition-colors">
          <h2 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600">
            {post.title}
          </h2>
          <p className="text-gray-700 mb-3 line-clamp-3">{post.excerpt}</p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => {
                // Handle both string tags and tag objects
                const tagName = typeof tag === 'string' ? tag : tag.name;
                const tagSlug = typeof tag === 'string' ? tag : tag.slug;
                return (
                    <span
                    key={tagSlug}
                    className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100"
                    >
                    #{tagName}
                    </span>
                );
                })}
            </div>
          )}
        </div>
      </Link>

      {/* Cover Image */}
      {post.cover_image && (
        <Link to={`/posts/${post.id}`}>
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
          />
        </Link>
      )}

      {/* Footer Stats */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 hover:text-blue-600">
            <Eye className="w-4 h-4" />
            {post.views_count}
          </span>
          <span className="flex items-center gap-1 hover:text-blue-600">
            <MessageCircle className="w-4 h-4" />
            {post.comments_count}
          </span>
          <span className="text-xs">
            {post.reading_time}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={handleLike}
          disabled={liking}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            liked
              ? 'text-red-600 bg-red-50 hover:bg-red-100'
              : 'text-gray-600 hover:bg-gray-100'
          } disabled:opacity-50`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{post.likes_count}</span>
        </button>

        <Link
          to={`/posts/${post.id}#comments`}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Comment</span>
        </Link>

        <button
          onClick={handleBookmark}
          disabled={bookmarking}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            bookmarked
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
              : 'text-gray-600 hover:bg-gray-100'
          } disabled:opacity-50`}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{post.bookmarks_count}</span>
        </button>

        <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
};
