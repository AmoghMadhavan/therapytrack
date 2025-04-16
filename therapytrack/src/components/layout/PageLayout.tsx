import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import { Toaster } from 'react-hot-toast';

interface PageLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
  hideFooter?: boolean;
  fullWidth?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  hideNav = false, 
  hideFooter = false,
  fullWidth = false
}) => {
  const { currentUser } = useAuth();
  
  // Always call the hook, but only enable the timeout if user is authenticated
  const timeoutEnabled = Boolean(currentUser);
  
  // Initialize the session timeout hook
  useSessionTimeout({
    // Only apply timeout for authenticated users
    timeoutMinutes: timeoutEnabled ? 30 : 0, // Use 0 to disable instead of large number
    warningMinutes: timeoutEnabled ? 1 : 0,  // Use 0 to disable instead of large number
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Toast notifications container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#333333',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '0.375rem',
            padding: '0.75rem 1rem',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            }
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            }
          }
        }}
      />
      
      {!hideNav && <Navbar />}
      
      <main className={`flex-grow ${fullWidth ? '' : 'container mx-auto px-4 sm:px-6 lg:px-8'}`}>
        {children}
      </main>
      
      {!hideFooter && <Footer />}
    </div>
  );
};

export default PageLayout; 