import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/config';
import { useAuth } from '../../contexts/SupabaseAuthContext';

interface ActivityMetrics {
  totalAIActivity: number;
  activitiesByType: Record<string, number>;
  activitiesByUser: Record<string, number>;
  clientExclusionsCount: number;
  aiDisabledUsersCount: number;
  timeRangeData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
  };
}

const ComplianceDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('30days');
  const [metrics, setMetrics] = useState<ActivityMetrics | null>(null);
  const [userDetails, setUserDetails] = useState<Record<string, any>>({});
  
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        
        // Calculate date range
        const now = new Date();
        const daysAgo = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - daysAgo);
        
        // Fetch all AI-related activities within the time range
        const { data: activities, error: activitiesError } = await supabase
          .from('activity_logs')
          .select('*')
          .or(`activity_type.ilike.%ai_%,activity_type.eq.audit_log_export`)
          .gte('timestamp', startDate.toISOString())
          .order('timestamp', { ascending: false });
          
        if (activitiesError) {
          console.error('Error fetching activity logs:', activitiesError);
          return;
        }
        
        // Fetch all users who have AI related preferences
        const { data: userPrefs, error: prefsError } = await supabase
          .from('user_preferences')
          .select('user_id, ai_preferences');
          
        if (prefsError) {
          console.error('Error fetching user preferences:', prefsError);
          return;
        }
        
        // Fetch user details for all users with preferences
        if (userPrefs && userPrefs.length > 0) {
          const userIds = userPrefs.map(pref => pref.user_id);
          const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name')
            .in('id', userIds);
            
          if (usersError) {
            console.error('Error fetching user details:', usersError);
          } else if (users) {
            const userMap: Record<string, any> = {};
            users.forEach(user => {
              userMap[user.id] = user;
            });
            setUserDetails(userMap);
          }
        }
        
        // Process metrics
        const activityCounts: Record<string, number> = {};
        const userActivityCounts: Record<string, number> = {};
        
        // Count activities by type and user
        if (activities) {
          activities.forEach(activity => {
            // Count by activity type
            if (!activityCounts[activity.activity_type]) {
              activityCounts[activity.activity_type] = 0;
            }
            activityCounts[activity.activity_type]++;
            
            // Count by user
            if (!userActivityCounts[activity.user_id]) {
              userActivityCounts[activity.user_id] = 0;
            }
            userActivityCounts[activity.user_id]++;
          });
        }
        
        // Count users with AI disabled and client exclusions
        let aiDisabledCount = 0;
        let totalClientExclusions = 0;
        
        if (userPrefs) {
          userPrefs.forEach(pref => {
            if (pref.ai_preferences && !pref.ai_preferences.enableAI) {
              aiDisabledCount++;
            }
            
            if (pref.ai_preferences && pref.ai_preferences.clientExclusions && 
                Array.isArray(pref.ai_preferences.clientExclusions)) {
              totalClientExclusions += pref.ai_preferences.clientExclusions.length;
            }
          });
        }
        
        // Prepare time series data (last N days of activity)
        const labels: string[] = [];
        const dailyCounts: number[] = [];
        
        for (let i = 0; i < daysAgo; i++) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          
          // Format as MM/DD
          const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
          labels.unshift(formattedDate);
          
          // Count activities for this day
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);
          
          const dayCount = activities ? activities.filter(a => {
            const timestamp = new Date(a.timestamp);
            return timestamp >= dayStart && timestamp <= dayEnd;
          }).length : 0;
          
          dailyCounts.unshift(dayCount);
        }
        
        // Calculate total AI activity
        const totalAIActivity = activities ? activities.length : 0;
        
        // Set metrics
        setMetrics({
          totalAIActivity,
          activitiesByType: activityCounts,
          activitiesByUser: userActivityCounts,
          clientExclusionsCount: totalClientExclusions,
          aiDisabledUsersCount: aiDisabledCount,
          timeRangeData: {
            labels,
            datasets: [
              {
                label: 'AI Activities',
                data: dailyCounts
              }
            ]
          }
        });
      } catch (error) {
        console.error('Error fetching compliance metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMetrics();
  }, [currentUser, timeRange]);
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">HIPAA Compliance Dashboard</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Monitor AI usage and compliance across the platform</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === '7days' 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === '30days' 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('90days')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === '90days' 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              90 Days
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="px-4 py-12 sm:px-6 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : metrics ? (
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {/* Top stats cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total AI Activities</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{metrics.totalAIActivity}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{Object.keys(metrics.activitiesByUser).length}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">AI Disabled Users</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{metrics.aiDisabledUsersCount}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Client Exclusions</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{metrics.clientExclusionsCount}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Activity breakdown by type */}
            <div className="mt-8">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Activity Breakdown</h3>
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {Object.entries(metrics.activitiesByType)
                    .sort(([, countA], [, countB]) => countB - countA)
                    .map(([type, count]) => (
                      <li key={type} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-primary-600 truncate">
                            {type.replace(/_/g, ' ')}
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {count} {count === 1 ? 'activity' : 'activities'}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
            
            {/* Top users by activity */}
            <div className="mt-8">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Most Active Users</h3>
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {Object.entries(metrics.activitiesByUser)
                    .sort(([, countA], [, countB]) => countB - countA)
                    .slice(0, 5) // Show top 5
                    .map(([userId, count]) => {
                      const user = userDetails[userId] || { email: 'Unknown User' };
                      const displayName = user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : user.email;
                      
                      return (
                        <li key={userId} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {displayName}
                            </div>
                            <div className="ml-2 flex-shrink-0 flex">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {count} {count === 1 ? 'activity' : 'activities'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">{user.email}</div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>
            
            {/* HIPAA compliance note */}
            <div className="mt-8 p-4 bg-blue-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-700">
                    <strong>HIPAA Compliance Tip:</strong> Regular monitoring of AI usage and data handling practices is essential for maintaining HIPAA compliance. Remember to download and archive audit logs for compliance documentation.
                  </p>
                  <p className="mt-3 text-sm md:mt-0 md:ml-6">
                    <a href="/settings/compliance/audit-logs" className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600">
                      Export Logs <span aria-hidden="true">&rarr;</span>
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-gray-500">No data available for the selected time range.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceDashboard; 