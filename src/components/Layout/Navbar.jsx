import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code, Bell, User, LogOut, Menu, X, Search, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { SearchBar } from '../SearchBar';
import { CreatePostModal } from '../posts/CreatePostModal';

export const Navbar = ({ onSearch, setActiveTab, setPosts, setPage }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();


  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (query) => {
    if (onSearch) {
      onSearch(query);
    }
    if (setActiveTab) setActiveTab('search');
    if (setPage) setPage(1);
    if (setPosts) setPosts([]);
  };

  const handlePostCreated = (newPost) => {
    console.log('New post created:', newPost);
    setShowCreateModal(false);
    navigate('/');
  };

  return (
    <>
      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80">
              <Code className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">DevConnect</h1>
            </Link>

            {/* Search - Hidden on mobile */}
            <div className="flex-1 max-w-md hidden md:block">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Right Side Items */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition" aria-label="Notifications">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Post Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Post
              </button>

              {/* Desktop User Menu */}
              <div className="hidden sm:flex items-center gap-4">
                {user && (
                  <>
                    <Link
                      to={`users/${user.id}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
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
                      <span className="text-sm font-medium">{user.username}</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {showMenu ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMenu && (
            <div className="sm:hidden mt-4 pt-4 border-t border-gray-200 space-y-4">
              <div className="px-2">
                <SearchBar onSearch={handleSearch} />

              </div>

              {user && (
                <>
                  <Link
                    to={`users/${user.id}`}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setShowMenu(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};