// ============================================================================
// src/pages/Search.jsx - Advanced Search Page
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { apiClient } from '../services/api';
import { PostCard } from '../components/posts/PostCard';
import { UserListItem } from '../components/Users/UserListItem';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery); // Separate input state
  const [searchType, setSearchType] = useState('all'); // all, posts, users, snippets
  const [sortBy, setSortBy] = useState('relevance'); // relevance, newest, popular
  const [showFilters, setShowFilters] = useState(false);
  const [tagFilter, setTagFilter] = useState('');
  const [minReputation, setMinReputation] = useState('');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let allResults = [];
      const searchParams = {
        search: searchQuery,
        page: 1,
        page_size: 20
      };

      // Add tag filter if present
      if (tagFilter) {
        searchParams.tags = tagFilter;
      }

      if (searchType === 'all' || searchType === 'posts') {
        try {
          const postsData = await apiClient.getPosts(searchParams);
          const posts = Array.isArray(postsData) 
            ? postsData 
            : (postsData.results || []);
          
          const postsWithType = posts.map(p => ({
            ...p,
            type: 'post'
          }));
          allResults = [...allResults, ...postsWithType];
        } catch (err) {
          console.error('Error fetching posts:', err);
        }
      }

      if (searchType === 'all' || searchType === 'users') {
        try {
          const usersData = await apiClient.getUsers(searchParams);
          const users = Array.isArray(usersData) 
            ? usersData 
            : (usersData.results || []);
          
          // Apply reputation filter
          const filteredUsers = minReputation 
            ? users.filter(u => (u.reputation || 0) >= parseInt(minReputation))
            : users;
          
          const usersWithType = filteredUsers.map(u => ({
            ...u,
            type: 'user'
          }));
          allResults = [...allResults, ...usersWithType];
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      }

      if (searchType === 'all' || searchType === 'snippets') {
        try {
          const snippetsData = await apiClient.getSnippets(searchParams);
          const snippets = Array.isArray(snippetsData) 
            ? snippetsData 
            : (snippetsData.results || []);
          
          const snippetsWithType = snippets.map(s => ({
            ...s,
            type: 'snippet'
          }));
          allResults = [...allResults, ...snippetsWithType];
        } catch (err) {
          console.error('Error fetching snippets:', err);
        }
      }

      // Apply sorting
      if (sortBy === 'newest') {
        allResults.sort((a, b) => 
          new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
      } else if (sortBy === 'popular') {
        allResults.sort((a, b) => {
          const aScore = (a.likes_count || 0) + (a.followers_count || 0) + (a.views_count || 0);
          const bScore = (b.likes_count || 0) + (b.followers_count || 0) + (b.views_count || 0);
          return bScore - aScore;
        });
      }

      setResults(allResults);
      setHasMore(allResults.length >= 20);
      setPage(1);

      // Update URL
      if (searchQuery) {
        setSearchParams({ q: searchQuery });
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to perform search');
    } finally {
      setLoading(false);
    }
  }, [searchType, sortBy, tagFilter, minReputation, setSearchParams]);

  // Perform search when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query !== inputValue) {
        setQuery(inputValue);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [inputValue, query]);

  // Trigger search when query or filters change
  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setQuery(inputValue);
  };

  const handleClearSearch = () => {
    setInputValue('');
    setQuery('');
    setResults([]);
    setSearchParams({});
  };

  const handleLike = async (postId, isLiked) => {
    try {
      if (isLiked) {
        await apiClient.unlikePost(postId);
      } else {
        await apiClient.likePost(postId);
      }
      
      // Update local state
      setResults(prevResults => prevResults.map(result =>
        result.id === postId && result.type === 'post'
          ? {
              ...result,
              is_liked: !isLiked,
              likes_count: result.likes_count + (isLiked ? -1 : 1),
            }
          : result
      ));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleBookmark = async (postId, isBookmarked) => {
    try {
      if (isBookmarked) {
        await apiClient.unbookmarkPost(postId);
      } else {
        await apiClient.bookmarkPost(postId);
      }
      
      // Update local state
      setResults(prevResults => prevResults.map(result =>
        result.id === postId && result.type === 'post'
          ? {
              ...result,
              is_bookmarked: !isBookmarked,
              bookmarks_count: (result.bookmarks_count || 0) + (isBookmarked ? -1 : 1),
            }
          : result
      ));
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const handleApplyFilters = () => {
    setPage(1);
    performSearch(query);
  };

  const displayedResults = results.slice(0, page * 20);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Search</h1>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search posts, users, snippets..."
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>

          {/* Search Controls */}
          <div className="flex flex-wrap gap-3">
            {/* Type Filter */}
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'posts', label: 'Posts' },
                { value: 'users', label: 'Users' },
                { value: 'snippets', label: 'Snippets' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    setSearchType(value);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    searchType === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
            </select>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
                showFilters 
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Advanced Filters</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    placeholder="Enter tags (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {(searchType === 'all' || searchType === 'users') && (
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Min Reputation</label>
                    <input
                      type="number"
                      value={minReputation}
                      onChange={(e) => setMinReputation(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                <button
                  onClick={handleApplyFilters}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {loading && displayedResults.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : query && displayedResults.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No results found for "{query}"</p>
            <p className="text-gray-400 mt-2">Try different keywords or filters</p>
          </div>
        ) : query ? (
          <div>
            <p className="text-gray-600 mb-4">
              Found <span className="font-semibold text-gray-900">{results.length}</span> result{results.length !== 1 ? 's' : ''}
            </p>

            {/* Results List */}
            <div className="space-y-4">
              {displayedResults.map((result) => (
                <div key={`${result.type}-${result.id}`}>
                  {result.type === 'post' && (
                    <PostCard
                      post={result}
                      onLike={handleLike}
                      onBookmark={handleBookmark}
                    />
                  )}
                  {result.type === 'user' && (
                    <UserListItem user={result} />
                  )}
                  {result.type === 'snippet' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <h3 className="font-semibold text-gray-900 mb-2">{result.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {result.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                          {result.language && (
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                              {result.language.name || result.language}
                            </span>
                          )}
                          {result.author && (
                            <span className="text-xs text-gray-500">
                              by {result.author.username}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">
                          ❤️ {result.likes_count || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && displayedResults.length < results.length && (
              <button
                onClick={() => setPage(prevPage => prevPage + 1)}
                disabled={loading}
                className="w-full mt-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition font-medium disabled:opacity-50"
              >
                Load More
              </button>
            )}

            {displayedResults.length === results.length && results.length > 0 && !hasMore && (
              <p className="text-center text-gray-500 mt-6">
                Showing all {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Searching</h3>
            <p className="text-gray-600">
              Enter a search term to find posts, users, and snippets
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;