import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 py-4 text-center border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} SentiVibe. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;