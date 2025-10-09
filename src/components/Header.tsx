import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-background border-b border-border p-4 flex items-center justify-between">
      <Link to="/" className="flex items-center space-x-2">
        {/* Replaced image logo with a grand word logo */}
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">SentiVibe</h1>
      </Link>
      {/* You can add navigation links or user info here later */}
    </header>
  );
};

export default Header;