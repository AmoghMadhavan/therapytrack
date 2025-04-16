import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="text-gray-500">
          &copy; {new Date().getFullYear()} Theriq. All rights reserved.
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex space-x-6">
            <Link to="/about" className="text-gray-500 hover:text-gray-600">About</Link>
            <Link to="/privacy" className="text-gray-500 hover:text-gray-600">Privacy</Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-600">Terms</Link>
            <Link to="/contact" className="text-gray-500 hover:text-gray-600">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 