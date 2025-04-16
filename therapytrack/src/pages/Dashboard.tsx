import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabase/config';
import PageLayout from '../components/layout/PageLayout';
import { getCurrentSubscriptionTier, subscriptionTiers } from '../services/subscriptionService';
import { getFromCache, setInCache } from '../utils/cache';

interface DashboardStats {
  clients: number;
  sessions: number;
  upcomingSessions: number;
  completedSessions: number;
}

interface SubscriptionInfo {
  tier: string;
  clientLimit: number | string;
  status: string;
  expiryDate: string;
}

// Types for session objects
interface Session {
  id: string;
  date: string;
  status: string;
  [key: string]: any;
}

const Dashboard: React.FC = () => {
  const { currentUser, session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    clients: 0,
    sessions: 0,
    upcomingSessions: 0,
    completedSessions: 0
  });
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    tier: 'starter',
    clientLimit: 3,
    status: 'active',
    expiryDate: 'N/A'
  });

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      console.log('Dashboard - No user detected, redirecting to login');
      navigate('/login');
      return;
    }
    
    console.log('Dashboard - User authenticated, continuing to dashboard');
    
    // First try to load data from cache for immediate display
    const userId = currentUser.id;
    const CACHE_KEY_STATS = `user_${userId}_dashboard_stats`;
    const CACHE_KEY_SUBSCRIPTION = `user_${userId}_subscription`;
    
    const cachedStats = getFromCache<DashboardStats>(CACHE_KEY_STATS);
    const cachedSubscription = getFromCache<SubscriptionInfo>(CACHE_KEY_SUBSCRIPTION);
    
    if (cachedStats) {
      console.log('Using cached dashboard stats');
      setStats(cachedStats);
    }
    
    if (cachedSubscription) {
      console.log('Using cached subscription info');
      setSubscription(cachedSubscription);
    }
    
    // If we have both from cache, don't show loading state
    if (cachedStats && cachedSubscription) {
      setLoading(false);
    }
    
    // Fetch dashboard stats and subscription info in the background
    const fetchData = async () => {
      try {
        if (!cachedStats || !cachedSubscription) {
          setLoading(true);
        }
        setError(null);
        
        // Run all queries in parallel instead of sequentially using Promise.all with proper error handling
        const [
          subscriptionTierResult,
          profileResult,
          clientsResult,
          sessionsResult
        ] = await Promise.all([
          // Get subscription tier - with fallback
          getCurrentSubscriptionTier(userId).catch(() => 'starter'),
          
          // Get profile data - wrap in a try/catch for proper TypeScript handling
          (async () => {
            try {
              const result = await supabase
                .from('profiles')
                .select('subscription_tier, subscription_status, subscription_expiry')
                .eq('id', userId)
                .single();
              return result;
            } catch (e) {
              return { data: null, error: { message: 'Failed to fetch profile' } };
            }
          })(),
          
          // Get clients count - wrapped in proper async function
          (async () => {
            try {
              const result = await supabase
                .from('clients')
                .select('*', { count: 'exact' })
                .eq('therapist_id', userId);
              return result;
            } catch (e) {
              return { data: [], count: 0, error: null };
            }
          })(),
          
          // Get sessions data - wrapped in proper async function
          (async () => {
            try {
              const result = await supabase
                .from('sessions')
                .select('*', { count: 'exact' })
                .eq('therapist_id', userId);
              return result;
            } catch (e) {
              return { data: [], count: 0, error: null };
            }
          })()
        ]);
        
        // Process profile/subscription data
        const profileData = profileResult.data;
        const subscriptionTier = subscriptionTierResult || 'starter';
        
        // Get tier config
        const tierConfig = profileData?.subscription_tier 
          ? subscriptionTiers[profileData.subscription_tier as keyof typeof subscriptionTiers] || subscriptionTiers.starter
          : subscriptionTiers.starter;
        
        // Build subscription info
        const subscriptionInfo: SubscriptionInfo = {
          tier: profileData?.subscription_tier || 'starter',
          clientLimit: tierConfig.clientLimit === Infinity ? 'Unlimited' : tierConfig.clientLimit,
          status: profileData?.subscription_status || 'active',
          expiryDate: profileData?.subscription_expiry ? new Date(profileData.subscription_expiry).toLocaleDateString() : 'N/A'
        };
        
        // Save and cache subscription info
        setSubscription(subscriptionInfo);
        setInCache(CACHE_KEY_SUBSCRIPTION, subscriptionInfo, 30); // Cache for 30 minutes
        
        // Process clients data
        const clientsData = clientsResult.data || [];
        const clientsCount = clientsResult.count || clientsData.length;
        
        // Process sessions data
        const sessionsData = (sessionsResult.data || []) as Session[];
        const sessionsCount = sessionsResult.count || sessionsData.length;
        
        // Count upcoming sessions (sessions with date in the future)
        const now = new Date();
        const upcomingSessions = sessionsData.filter(session => 
          new Date(session.date) > now && session.status !== 'canceled'
        ).length;
        
        // Count completed sessions
        const completedSessions = sessionsData.filter(session => 
          session.status === 'completed'
        ).length;
        
        // Build and save stats
        const dashboardStats: DashboardStats = {
          clients: clientsCount,
          sessions: sessionsCount,
          upcomingSessions,
          completedSessions
        };
        
        // Update state and cache
        setStats(dashboardStats);
        setInCache(CACHE_KEY_STATS, dashboardStats, 15); // Cache for 15 minutes
        
        console.log('Dashboard stats loaded successfully', dashboardStats);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    // Always fetch fresh data, even if we have cache
    fetchData();
  }, [currentUser, session, navigate]);

  if (loading && !stats.clients) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </PageLayout>
    );
  }

  // Check if approaching client limit
  const isNearLimit = typeof subscription.clientLimit === 'number' && 
    stats.clients >= (subscription.clientLimit - 1) && 
    stats.clients < subscription.clientLimit;
    
  // Check if at client limit
  const isAtLimit = typeof subscription.clientLimit === 'number' && 
    stats.clients >= subscription.clientLimit;

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Theriq</h1>
          <div>
            {currentUser && (
              <p className="text-gray-600">
                Signed in as <span className="font-medium">{currentUser.email}</span>
              </p>
            )}
          </div>
        </div>
        
        {/* Show error if present */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Subscription info card */}
        <div className="mb-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Subscription: <span className="font-semibold text-primary-600">{subscription.tier === 'starter' ? 'Starter' : subscription.tier === 'pro' ? 'Pro' : 'Premium AI'}</span>
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {stats.clients} / {subscription.clientLimit} clients
                {subscription.tier !== 'pro' && subscription.tier !== 'premium' && (
                  <span className="ml-2">
                    <Link to="/account" className="text-primary-600 hover:text-primary-500 font-medium">
                      Upgrade for more
                    </Link>
                  </span>
                )}
              </p>
            </div>
            <Link
              to="/account"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Manage Subscription
            </Link>
          </div>
        </div>
        
        {/* Client limit warnings */}
        {isAtLimit && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  You've reached your client limit. 
                  <Link to="/account" className="font-medium underline text-red-700 hover:text-red-600 ml-1">
                    Upgrade your subscription
                  </Link> to add more clients.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {isNearLimit && !isAtLimit && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You're approaching your client limit. 
                  <Link to="/account" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1">
                    Upgrade your subscription
                  </Link> for more capacity.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.clients}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link to="/clients" className="font-medium text-primary-600 hover:text-primary-500">
                  View all clients
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Sessions</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.sessions}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link to="/sessions" className="font-medium text-secondary-600 hover:text-secondary-500">
                  View all sessions
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Sessions</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.upcomingSessions}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link to="/sessions" className="font-medium text-green-600 hover:text-green-500">
                  View upcoming
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed Sessions</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.completedSessions}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link to="/sessions" className="font-medium text-blue-600 hover:text-blue-500">
                  View history
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Link 
              to={isAtLimit ? "/account" : "/clients/new"} 
              className={`w-full flex items-center justify-center px-4 py-4 border border-transparent rounded-md shadow-sm text-white ${
                isAtLimit 
                  ? 'bg-gray-400 hover:bg-gray-500' 
                  : 'bg-primary-600 hover:bg-primary-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
            >
              <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {isAtLimit ? 'Upgrade to Add Client' : 'New Client'}
            </Link>
            <Link to="/sessions/new" className="w-full flex items-center justify-center px-4 py-4 border border-transparent rounded-md shadow-sm text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500">
              <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule Session
            </Link>
            <Link to="/account" className="w-full flex items-center justify-center px-4 py-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Manage Subscription
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard; 