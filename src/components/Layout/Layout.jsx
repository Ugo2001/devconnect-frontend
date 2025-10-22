// ============================================================================
// src/components/Layout/Layout.jsx - Main Layout Wrapper
// ============================================================================

import { Navbar } from './Navbar';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {children}
    </div>
  );
};