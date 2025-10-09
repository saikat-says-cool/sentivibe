import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-background border-b border-border p-4 flex items-center justify-between">
      <Link to="/" className="flex items-center space-x-2">
        <img src="/logo.png" alt="SentiVibe Logo" className="h-8 w-auto" />
        <span className="text-xl font-bold text-foreground">SentiVibe</span>
      </Link>
      {/* You can add navigation links or user info here later */}
    </header>
  );
};

export default Header;