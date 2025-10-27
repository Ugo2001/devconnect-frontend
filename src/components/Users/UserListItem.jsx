// ============================================================================
// src/components/Users/UserListItem.jsx - User List Item
// ============================================================================

import { Link } from 'react-router-dom';

export const UserListItem = ({ user }) => {
  return (
    <Link
      to={`users/${user.id}`}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow flex items-center gap-4"
    >
      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-lg font-bold text-gray-600">
            {user.username[0].toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">
          {user.full_name || user.username}
        </h4>
        <p className="text-sm text-gray-600">@{user.username}</p>
        {user.bio && (
          <p className="text-sm text-gray-600 line-clamp-1 mt-1">{user.bio}</p>
        )}
      </div>
      <div className="text-right text-sm text-gray-600">
        <div className="font-semibold">{user.reputation}</div>
        <div className="text-xs">reputation</div>
      </div>
    </Link>
  );
};
