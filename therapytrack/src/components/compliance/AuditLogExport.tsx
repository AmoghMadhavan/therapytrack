import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/config';
import { useAuth } from '../../contexts/SupabaseAuthContext';

interface AuditLogExportProps {
  isAdmin?: boolean;
}

const AuditLogExport: React.FC<AuditLogExportProps> = ({ isAdmin = false }) => {
  const { currentUser } = useAuth();
  const [dateRange, setDateRange] = useState<{start: string; end: string}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  const [activityTypes, setActivityTypes] = useState<string[]>([]);
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Fetch available activity types
  useEffect(() => {
    const fetchActivityTypes = async () => {
      if (!currentUser) return;
      
      try {
        // Only fetch distinct activity_types from logs the user is authorized to see
        const query = isAdmin 
          ? supabase.from('activity_logs').select('activity_type', { count: 'exact', head: false }).limit(100)
          : supabase.from('activity_logs').select('activity_type', { count: 'exact', head: false })
              .eq('user_id', currentUser.id).limit(100);
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching activity types:', error);
          return;
        }
        
        if (data) {
          // Extract unique activity types
          const typesSet = new Set(data.map(log => log.activity_type));
          const types = Array.from(typesSet);
          setActivityTypes(types);
          
          // Default to selecting AI-related activity types
          const aiTypes = types.filter(type => type.includes('ai_'));
          setSelectedActivityTypes(aiTypes);
        }
      } catch (error) {
        console.error('Error in fetchActivityTypes:', error);
      }
    };
    
    fetchActivityTypes();
  }, [currentUser, isAdmin]);

  const handleActivityTypeChange = (type: string) => {
    setSelectedActivityTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const exportToCSV = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      setExportStatus('loading');
      
      // Build query based on filters
      const startDate = new Date(`${dateRange.start}T00:00:00Z`).toISOString();
      const endDate = new Date(`${dateRange.end}T23:59:59Z`).toISOString();
      
      let query = isAdmin
        ? supabase.from('activity_logs').select('*')
        : supabase.from('activity_logs').select('*')
            .eq('user_id', currentUser.id);
            
      // Add date range filter
      query = query
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);
        
      // Add activity type filter if types are selected
      if (selectedActivityTypes.length > 0) {
        query = query.in('activity_type', selectedActivityTypes);
      }
      
      // Order by timestamp
      query = query.order('timestamp', { ascending: false });
      
      // Execute query
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching audit logs:', error);
        setExportStatus('error');
        return;
      }
      
      if (!data || data.length === 0) {
        alert('No logs found for the selected criteria.');
        setExportStatus('idle');
        setIsLoading(false);
        return;
      }
      
      // Format data for CSV
      const csvRows = [];
      
      // Add header row
      const headers = [
        'Timestamp', 
        'Activity Type', 
        'User ID', 
        'Client ID', 
        'Session ID', 
        'IP Address', 
        'User Agent', 
        'Details'
      ];
      csvRows.push(headers.join(','));
      
      // Add data rows
      for (const log of data) {
        const row = [
          new Date(log.timestamp).toISOString(),
          log.activity_type,
          log.user_id,
          log.related_client_id || '',
          log.related_session_id || '',
          log.ip_address || '',
          `"${(log.user_agent || '').replace(/"/g, '""')}"`, // Escape quotes for CSV
          `"${JSON.stringify(log.details || {}).replace(/"/g, '""')}"` // Escape quotes for CSV
        ];
        csvRows.push(row.join(','));
      }
      
      // Create CSV content
      const csvContent = csvRows.join('\n');
      
      // Create blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `hipaa_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Log this export activity
      await supabase.from('activity_logs').insert({
        user_id: currentUser.id,
        activity_type: 'audit_log_export',
        timestamp: new Date().toISOString(),
        details: { 
          dateRange, 
          activityTypes: selectedActivityTypes,
          recordCount: data.length
        }
      });
      
      setExportStatus('success');
    } catch (error) {
      console.error('Error exporting logs:', error);
      setExportStatus('error');
    } finally {
      setIsLoading(false);
      // Reset status after a delay
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Export Audit Logs</h2>
      <p className="text-sm text-gray-500 mb-6">
        Export HIPAA-compliant audit logs for compliance reporting and record-keeping.
        {isAdmin && " As an administrator, you can export logs for all users."}
      </p>
      
      <div className="space-y-6">
        {/* Date Range Selector */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-2">Date Range</h3>
          <div className="flex space-x-4">
            <div>
              <label htmlFor="start-date" className="block text-sm text-gray-500">Start Date</label>
              <input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm text-gray-500">End Date</label>
              <input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Activity Type Selector */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-2">Activity Types</h3>
          <div className="max-h-40 overflow-y-auto border rounded-md p-2">
            {activityTypes.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No activity types found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activityTypes.map(type => (
                  <div key={type} className="flex items-center">
                    <input
                      id={`type-${type}`}
                      type="checkbox"
                      checked={selectedActivityTypes.includes(type)}
                      onChange={() => handleActivityTypeChange(type)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`type-${type}`} className="ml-2 block text-sm text-gray-700">
                      {type.replace(/_/g, ' ')}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Export Button */}
        <div className="flex items-center justify-between border-t pt-4">
          <div>
            {exportStatus === 'success' && (
              <p className="text-sm text-green-600">Logs exported successfully!</p>
            )}
            {exportStatus === 'error' && (
              <p className="text-sm text-red-600">Error exporting logs. Please try again.</p>
            )}
          </div>
          <button
            onClick={exportToCSV}
            disabled={isLoading || selectedActivityTypes.length === 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isLoading || selectedActivityTypes.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              'Export to CSV'
            )}
          </button>
        </div>
        
        {/* HIPAA Note */}
        <div className="mt-6 border-t pt-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>HIPAA Compliance Note:</strong> This export includes audit logs that may be required during a HIPAA audit. 
              The logs track all AI interactions, data access, and settings changes, providing a complete audit trail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogExport; 