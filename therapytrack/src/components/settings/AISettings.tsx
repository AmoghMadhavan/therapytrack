import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../lib/supabase/config';
import Toggle from '../ui/Toggle';

interface AIPreferences {
  enableAI: boolean;
  enableSessionAnalysis: boolean;
  enableTreatmentPlans: boolean;
  enableProgressPrediction: boolean;
  enableTranscription: boolean;
  clientExclusions: string[]; // Array of client IDs excluded from AI
}

const AISettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [preferences, setPreferences] = useState<AIPreferences>({
    enableAI: true,
    enableSessionAnalysis: true,
    enableTreatmentPlans: true,
    enableProgressPrediction: true,
    enableTranscription: true,
    clientExclusions: [],
  });
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchPreferencesAndClients = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch user's AI preferences
        const { data: prefsData, error: prefsError } = await supabase
          .from('user_preferences')
          .select('ai_preferences')
          .eq('user_id', currentUser.id)
          .single();
          
        if (prefsError && prefsError.code !== 'PGRST116') {
          console.error('Error fetching AI preferences:', prefsError);
        }
        
        if (prefsData?.ai_preferences) {
          setPreferences(prefsData.ai_preferences as AIPreferences);
        }
        
        // Fetch user's clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, first_name, last_name')
          .eq('therapist_id', currentUser.id)
          .order('last_name', { ascending: true });
          
        if (clientsError) {
          console.error('Error fetching clients:', clientsError);
        } else {
          setClients(clientsData || []);
        }
      } catch (error) {
        console.error('Error in fetching AI settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPreferencesAndClients();
  }, [currentUser]);
  
  const savePreferences = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      
      // Save to database
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: currentUser.id,
          ai_preferences: preferences,
          updated_at: new Date().toISOString(),
        });
        
      if (error) {
        console.error('Error saving AI preferences:', error);
        alert('Failed to save preferences. Please try again.');
      } else {
        setSuccessMessage('AI settings saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Log the settings change for audit purposes
        try {
          await supabase.from('activity_logs').insert({
            user_id: currentUser.id,
            activity_type: 'ai_settings_update',
            timestamp: new Date().toISOString(),
            details: { 
              ai_enabled: preferences.enableAI,
              excluded_clients_count: preferences.clientExclusions.length
            }
          });
        } catch (logError) {
          console.error('Could not log AI settings update:', logError);
          // Continue despite logging error
        }
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const toggleClientExclusion = (clientId: string) => {
    setPreferences(prev => {
      const newExclusions = [...prev.clientExclusions];
      
      if (newExclusions.includes(clientId)) {
        // Remove from exclusions
        return {
          ...prev,
          clientExclusions: newExclusions.filter(id => id !== clientId)
        };
      } else {
        // Add to exclusions
        return {
          ...prev,
          clientExclusions: [...newExclusions, clientId]
        };
      }
    });
  };
  
  if (loading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-6"></div>
        <div className="h-10 bg-gray-300 rounded w-full mb-4"></div>
        <div className="h-10 bg-gray-300 rounded w-full mb-4"></div>
        <div className="h-10 bg-gray-300 rounded w-full mb-4"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Feature Settings</h2>
      
      <div className="space-y-8">
        {/* Global AI toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Enable AI Features</h3>
            <p className="text-sm text-gray-500">
              Master switch for all AI-powered features
            </p>
          </div>
          <Toggle
            enabled={preferences.enableAI}
            onChange={() => setPreferences(prev => ({
              ...prev,
              enableAI: !prev.enableAI
            }))}
          />
        </div>
        
        <div className={preferences.enableAI ? "opacity-100" : "opacity-50 pointer-events-none"}>
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Feature-Specific Settings</h3>
            
            {/* Session Analysis toggle */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-800">Session Analysis</h4>
                <p className="text-sm text-gray-500">
                  AI-generated insights from session history
                </p>
              </div>
              <Toggle
                enabled={preferences.enableSessionAnalysis}
                onChange={() => setPreferences(prev => ({
                  ...prev,
                  enableSessionAnalysis: !prev.enableSessionAnalysis
                }))}
                disabled={!preferences.enableAI}
              />
            </div>
            
            {/* Treatment Plans toggle */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-800">Treatment Plans</h4>
                <p className="text-sm text-gray-500">
                  AI-suggested treatment activities and exercises
                </p>
              </div>
              <Toggle
                enabled={preferences.enableTreatmentPlans}
                onChange={() => setPreferences(prev => ({
                  ...prev,
                  enableTreatmentPlans: !prev.enableTreatmentPlans
                }))}
                disabled={!preferences.enableAI}
              />
            </div>
            
            {/* Progress Prediction toggle */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-800">Progress Prediction</h4>
                <p className="text-sm text-gray-500">
                  AI predictions for expected progress timelines
                </p>
              </div>
              <Toggle
                enabled={preferences.enableProgressPrediction}
                onChange={() => setPreferences(prev => ({
                  ...prev,
                  enableProgressPrediction: !prev.enableProgressPrediction
                }))}
                disabled={!preferences.enableAI}
              />
            </div>
            
            {/* Transcription toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">Voice Transcription</h4>
                <p className="text-sm text-gray-500">
                  Convert speech to text for session notes
                </p>
              </div>
              <Toggle
                enabled={preferences.enableTranscription}
                onChange={() => setPreferences(prev => ({
                  ...prev,
                  enableTranscription: !prev.enableTranscription
                }))}
                disabled={!preferences.enableAI}
              />
            </div>
          </div>
          
          {/* Client-specific exclusions */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Client-Specific Settings</h3>
            <p className="text-sm text-gray-500 mb-4">
              Exclude specific clients from AI processing. Their data will never be used with AI features.
            </p>
            
            {clients.length === 0 ? (
              <p className="text-sm italic text-gray-500">No clients found</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {clients.map(client => (
                  <div key={client.id} className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-800">
                      {client.last_name}, {client.first_name}
                    </span>
                    <Toggle
                      // Toggle is ON when client is NOT excluded (for better UX)
                      enabled={!preferences.clientExclusions.includes(client.id)}
                      onChange={() => toggleClientExclusion(client.id)}
                      disabled={!preferences.enableAI}
                      label={preferences.clientExclusions.includes(client.id) ? 'AI Disabled' : 'AI Enabled'}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* HIPAA compliance information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">HIPAA Compliance</h3>
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Data Protection:</strong> All patient data is de-identified before processing with AI services. We adhere to HIPAA standards for protected health information (PHI).
            </p>
            <p className="text-sm text-blue-800 mt-2">
              <strong>Data Control:</strong> You maintain complete control over how and when AI features are used with your client data.
            </p>
            <p className="text-sm text-blue-800 mt-2">
              <strong>Audit Trail:</strong> All AI usage is logged for compliance and audit purposes.
            </p>
            <a href="/legal/privacy" className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block">
              View our AI Data Privacy Policy
            </a>
          </div>
        </div>
        
        {/* Save button */}
        <div className="border-t pt-6 flex items-center justify-between">
          <div>
            {successMessage && (
              <p className="text-sm text-green-600">{successMessage}</p>
            )}
          </div>
          <button
            onClick={savePreferences}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISettings; 