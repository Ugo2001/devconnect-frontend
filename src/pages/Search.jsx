// ============================================================================
// src/pages/Search.jsx - Advanced Search Page
// ============================================================================

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { apiClient } from '../services/api';
import { PostCard } from '../components/posts/PostCard';
import { UserListItem } from '../components/Users/UserListItem';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState('all'); // all, posts, users, snippets
  const [sortBy, setSortBy] = useState('relevance'); // relevance, newest, popular
  const [showFilters, setShowFilters] = useState(false);
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Perform search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      try {
        setLoading(true);
        setError(null);
        setPage(1);

        let allResults = [];

        if (searchType === 'all' || searchType === 'posts') {
          const postsData = await apiClient.getPosts({ 
            search: query,
            page: 1
          });
          const posts = (postsData.results || []).map(p => ({
            ...p,
            type: 'post'
          }));
          allResults = [...allResults, ...posts];
        }

        if (searchType === 'all' || searchType === 'users') {
          const usersData = await apiClient.getUsers({ 
            search: query,
            page: 1
          });
          const users = (usersData.results || []).map(u => ({
            ...u,
            type: 'user'
          }));
          allResults = [...allResults, ...users];
        }

        if (searchType === 'all' || searchType === 'snippets') {
          const snippetsData = await apiClient.getSnippets({ 
            search: query,
            page: 1
          });
          const snippets = (snippetsData.results || []).map(s => ({
            ...s,
            type: 'snippet'
          }));
          allResults = [...allResults, ...snippets];
        }

        // Apply sorting
        if (sortBy === 'newest') {
          allResults.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          );
        } else if (sortBy === 'popular') {
          allResults.sort((a, b) => {
            const aScore = (a.likes_count || 0) + (a.followers_count || 0) + (a.views_count || 0);
            const bScore = (b.likes_count || 0) + (b.followers_count || 0) + (b.views_count || 0);
            return bScore - aScore;
          });
        }

        setResults(allResults);
        setHasMore(allResults.length > 20);

        // Update URL
        setSearchParams({ q: query });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, searchType, sortBy, setSearchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // The useEffect above will handle the search
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setSearchParams({});
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts, users, snippets..."
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
              {query && (
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
            </select>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
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
                    placeholder="Enter tags (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Min Reputation</label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

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
              {displayedResults.map((result, index) => (
                <div key={`${result.type}-${result.id}`}>
                  {result.type === 'post' && (
                    <PostCard
                      post={result}
                      onLike={() => {}}
                      onBookmark={() => {}}
                    />
                  )}
                  {result.type === 'user' && (
                    <UserListItem user={result} />
                  )}
                  {result.type === 'snippet' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">{result.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {result.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {result.language.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            by {result.author.username}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          ❤️ {result.likes_count}
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
                onClick={() => setPage(page + 1)}
                className="w-full mt-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition font-medium"
              >
                Load More
              </button>
            )}

            {displayedResults.length === results.length && results.length > 0 && (
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
