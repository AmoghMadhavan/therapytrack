import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">Theriq</span>
          </div>
          <div className="flex space-x-4">
            <Link to="/login" className="px-4 py-2 rounded-md text-primary-600 hover:text-primary-800">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700">
              Register
            </Link>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Simplify your therapy practice</span>
                <span className="block text-primary-600">with Theriq</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg md:mt-5 md:text-xl">
                Theriq is a comprehensive platform designed for independent occupational and 
                speech therapists to manage clients, track sessions, assign exercises, and 
                communicate securely within a HIPAA-considerate environment.
              </p>
              <div className="mt-8 flex space-x-4">
                <Link to="/register" className="px-6 py-3 rounded-md bg-primary-600 text-white hover:bg-primary-700">
                  Get Started Free
                </Link>
                <Link to="/about" className="px-6 py-3 rounded-md border border-primary-600 text-primary-600 hover:text-primary-800 hover:border-primary-800">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="bg-secondary-100 rounded-lg p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-secondary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Complete client management</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-secondary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Structured session documentation</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-secondary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Exercise and task assignment</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-secondary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Secure client communication</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-secondary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Progress visualization</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500">
            &copy; {new Date().getFullYear()} Theriq. All rights reserved.
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-600">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-gray-600">Terms</a>
              <a href="#" className="text-gray-500 hover:text-gray-600">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 