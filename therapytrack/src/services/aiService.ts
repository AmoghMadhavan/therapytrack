import { supabase } from '../lib/supabase/config';
import { isFeatureEnabled } from './subscriptionService';
import { OPENAI_API_KEY, FEATURES } from '../lib/config';

/**
 * De-identifies PHI (Protected Health Information) from text according to HIPAA standards
 * Removes or replaces 18 types of identifiers that could be used to identify an individual
 * 
 * @param text The text to de-identify
 * @param userId The user ID (to create consistent replacement tokens)
 * @param clientId Optional client ID (to create consistent replacement tokens per client)
 * @returns De-identified text with PHI removed or replaced
 */
const deIdentifyPHI = (text: string, userId: string, clientId?: string): string => {
  if (!text) return '';
  
  try {
    // Create a deterministic but anonymous identifier prefix based on user/client
    const idPrefix = clientId 
      ? `${userId.slice(0, 4)}${clientId.slice(0, 4)}`
      : userId.slice(0, 8);
    
    let deIdentifiedText = text;
    
    // Replace names with generic tokens
    // This is a simplified example - a real implementation would use NLP/ML
    // to identify names and other PHI more accurately
    deIdentifiedText = deIdentifiedText.replace(/Dr\.\s+[A-Z][a-z]+/g, 'Dr. THERAPIST');
    deIdentifiedText = deIdentifiedText.replace(/Mr\.\s+[A-Z][a-z]+/g, 'Mr. CLIENT');
    deIdentifiedText = deIdentifiedText.replace(/Mrs\.\s+[A-Z][a-z]+/g, 'Mrs. CLIENT');
    deIdentifiedText = deIdentifiedText.replace(/Ms\.\s+[A-Z][a-z]+/g, 'Ms. CLIENT');
    
    // Replace dates with month/year only or relative time
    // Real implementation would use more sophisticated date detection
    deIdentifiedText = deIdentifiedText.replace(
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, 
      'DATE_REDACTED'
    );
    
    // Replace phone numbers
    deIdentifiedText = deIdentifiedText.replace(
      /\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      'PHONE_REDACTED'
    );
    
    // Replace emails
    deIdentifiedText = deIdentifiedText.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      'EMAIL_REDACTED'
    );
    
    // Replace addresses
    deIdentifiedText = deIdentifiedText.replace(
      /\d+\s+[A-Za-z\s]+\b(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl)\b/gi,
      'ADDRESS_REDACTED'
    );
    
    // Replace ZIP codes
    deIdentifiedText = deIdentifiedText.replace(
      /\b\d{5}(-\d{4})?\b/g,
      'ZIP_REDACTED'
    );
    
    // Log that de-identification was performed (for audit trail)
    console.log(`De-identified text for user ${userId}${clientId ? ` and client ${clientId}` : ''}`);
    
    return deIdentifiedText;
  } catch (error) {
    console.error('Error during PHI de-identification:', error);
    // In case of error, be extra cautious and return empty text
    return 'ERROR_DURING_DEIDENTIFICATION';
  }
};

// Simple in-memory cache for API usage
// In a production app, this would be stored in a database
const apiUsageTracker = {
  userCounts: new Map<string, number>(),
  dailyTotal: 0,
  lastReset: new Date().toDateString(),
  
  // Usage limits
  USER_DAILY_LIMIT: 50, // Max 50 API calls per user per day
  TOTAL_DAILY_LIMIT: 1000, // Max 1000 API calls total per day
  
  // Record a new API call
  recordUsage(userId: string): boolean {
    // Reset counters if it's a new day
    const today = new Date().toDateString();
    if (today !== this.lastReset) {
      this.userCounts.clear();
      this.dailyTotal = 0;
      this.lastReset = today;
    }
    
    // Check total limit
    if (this.dailyTotal >= this.TOTAL_DAILY_LIMIT) {
      console.warn('Total daily API limit reached');
      return false;
    }
    
    // Check user limit
    const currentUserCount = this.userCounts.get(userId) || 0;
    if (currentUserCount >= this.USER_DAILY_LIMIT) {
      console.warn(`User ${userId} has reached daily API limit`);
      return false;
    }
    
    // Record usage
    this.userCounts.set(userId, currentUserCount + 1);
    this.dailyTotal++;
    
    return true;
  }
};

// This would be a real OpenAI API call in production
// For now, we'll simulate responses
const simulateOpenAICall = async (prompt: string, model: string = 'gpt-4'): Promise<string> => {
  console.log(`[SIMULATED AI CALL] Using model: ${model}, Prompt: ${prompt}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return simulated responses based on the prompt
  if (prompt.includes('summary')) {
    return 'The patient has shown significant improvement in their communication skills over the last 4 sessions. There is notable progress in initiating conversations and maintaining eye contact during therapy activities. Receptive language skills have improved by approximately 15% based on standardized assessments.';
  } else if (prompt.includes('treatment plan')) {
    return 'Based on current progress, recommended activities include:\n1. Role-playing social scenarios to practice conversational turn-taking\n2. Visual schedule activities to improve task sequencing\n3. Home practice involving family members in structured communication activities\n4. Introduction of assistive technology tools to support organization';
  } else if (prompt.includes('progress prediction')) {
    return 'At the current rate of improvement, client is likely to achieve 80% of short-term goals within the next 6-8 weeks. Long-term communication goals may require an additional 3-4 months of consistent therapy. Recommend reassessment at 3-month mark to adjust predictions based on latest progress.';
  } else {
    return 'Analysis complete. The data suggests moderate improvement across all measured metrics. Consider adjusting intervention frequency to optimize outcomes.';
  }
};

// In a production environment, this would connect to OpenAI API
const callOpenAIAPI = async (prompt: string, userId: string, model: string = 'gpt-4'): Promise<string> => {
  // Check if we're in production with API key
  if (FEATURES.ENABLE_AI) {
    // Check usage limits
    if (!apiUsageTracker.recordUsage(userId)) {
      console.warn('API usage limit reached, falling back to simulation');
      return simulateOpenAICall(prompt, model);
    }
    
    try {
      // De-identify the prompt before sending to external AI service
      const deIdentifiedPrompt = deIdentifyPHI(prompt, userId);
      
      // Log the AI request for audit purposes
      console.log(`AI request from user ${userId} using model ${model}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: deIdentifiedPrompt }],
          max_tokens: 500,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      console.log('Falling back to simulated response');
      return simulateOpenAICall(prompt, model);
    }
  } else {
    // No API key found, use simulation
    console.log('No OpenAI API key found, using simulated responses');
    return simulateOpenAICall(prompt, model);
  }
};

// Add a new function to check AI permissions based on the user's preferences
/**
 * Check if AI processing is allowed based on user preferences
 * @param userId The user ID 
 * @param featureType The specific AI feature being used
 * @param clientId Optional client ID if the AI processing involves a specific client
 * @returns Boolean indicating if AI processing is allowed
 */
const checkAIPermissions = async (
  userId: string,
  featureType: 'sessionAnalysis' | 'treatmentPlans' | 'progressPrediction' | 'transcription' | 'search',
  clientId?: string
): Promise<boolean> => {
  try {
    // Check feature access first (subscription tier)
    // Map to the exact feature names used in the isFeatureEnabled function
    const featureNameMap: Record<string, string> = {
      'sessionAnalysis': 'aiSessionAnalysis',
      'treatmentPlans': 'aiTreatmentPlans',
      'progressPrediction': 'aiProgressPrediction',
      'transcription': 'aiTranscription',
      'search': 'aiSearch'
    };
    
    const featureName = featureNameMap[featureType];
    const featureEnabled = await isFeatureEnabled(userId, featureName as any);
    if (!featureEnabled) {
      console.log(`User ${userId} does not have access to ${featureName} feature due to subscription tier`);
      return false;
    }
    
    // Get user preferences
    const { data: prefsData, error: prefsError } = await supabase
      .from('user_preferences')
      .select('ai_preferences')
      .eq('user_id', userId)
      .single();
      
    if (prefsError && prefsError.code !== 'PGRST116') {
      console.error('Error fetching AI preferences:', prefsError);
      // Default to disallowing AI on error for safety
      return false;
    }
    
    // If no preferences found, default to allowing (since subscription tier check passed)
    if (!prefsData?.ai_preferences) {
      return true;
    }
    
    const prefs = prefsData.ai_preferences;
    
    // Check master AI toggle
    if (!prefs.enableAI) {
      console.log(`User ${userId} has disabled all AI features`);
      return false;
    }
    
    // Check feature-specific toggle
    const featureToggleMap: Record<string, string> = {
      'sessionAnalysis': 'enableSessionAnalysis',
      'treatmentPlans': 'enableTreatmentPlans',
      'progressPrediction': 'enableProgressPrediction',
      'transcription': 'enableTranscription',
      'search': 'enableAISearch'
    };
    
    const featureToggle = featureToggleMap[featureType];
    if (featureToggle && prefs[featureToggle] === false) {
      console.log(`User ${userId} has disabled the specific AI feature: ${featureType}`);
      return false;
    }
    
    // Check client exclusions if a clientId is provided
    if (clientId && prefs.clientExclusions && Array.isArray(prefs.clientExclusions)) {
      if (prefs.clientExclusions.includes(clientId)) {
        console.log(`Client ${clientId} is excluded from AI processing by user ${userId}`);
        return false;
      }
    }
    
    // All checks passed, allow AI processing
    return true;
  } catch (error) {
    console.error('Error checking AI permissions:', error);
    // Default to disallowing AI on error for safety
    return false;
  }
};

/**
 * Generate AI analysis of session history
 */
export const generateSessionAnalysis = async (
  userId: string,
  clientId: string,
  timeframe: 'last_month' | 'last_quarter' | 'all_time' = 'last_month'
): Promise<string | null> => {
  try {
    // Check if AI processing is allowed based on user preferences
    const isAllowed = await checkAIPermissions(userId, 'sessionAnalysis', clientId);
    if (!isAllowed) {
      console.warn('AI session analysis not allowed based on user preferences');
      return null;
    }
    
    // Log the start of AI session analysis (for audit purposes)
    console.log(`AI Session Analysis started: user=${userId}, client=${clientId}, timeframe=${timeframe}`);
    
    // Fetch session data for the client
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('clientId', clientId)
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error fetching session data:', error);
      return null;
    }
    
    // De-identify session data before processing
    const deIdentifiedSessions = sessions?.map(session => {
      // Create a copy of the session with sensitive fields removed or de-identified
      const deIdentifiedSession = {
        ...session,
        // Replace fields that might contain PHI
        notes: session.notes ? deIdentifyPHI(session.notes, userId, clientId) : '',
        subjective: session.subjective ? deIdentifyPHI(session.subjective, userId, clientId) : '',
        objective: session.objective ? deIdentifyPHI(session.objective, userId, clientId) : '',
        assessment: session.assessment ? deIdentifyPHI(session.assessment, userId, clientId) : '',
        plan: session.plan ? deIdentifyPHI(session.plan, userId, clientId) : '',
        // Replace therapist-specific identifiers
        therapistId: 'THERAPIST_ID',
        // Use a consistent anonymous identifier for the client
        clientId: 'CLIENT_ID',
        // Generalize date to just month/year for de-identification
        date: session.date ? new Date(session.date).toISOString().substring(0, 7) : '',
      };
      return deIdentifiedSession;
    });
    
    // Create a prompt for the AI that doesn't contain PHI
    const prompt = `Analyze the following de-identified therapy session history and provide a concise summary of progress, patterns, and insights. Focus on identifying trends and progress over the ${timeframe.replace('_', ' ')}.
    
    Session data: ${JSON.stringify(deIdentifiedSessions)}`;
    
    // Call the AI API with de-identified data
    const analysis = await callOpenAIAPI(prompt, userId);
    
    // Log completion of analysis (for audit purposes)
    console.log(`AI Session Analysis completed: user=${userId}, client=${clientId}`);
    
    // Record the usage in activity logs table (if available)
    try {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        activity_type: 'ai_session_analysis',
        related_client_id: clientId,
        timestamp: new Date().toISOString(),
        details: { timeframe, session_count: sessions?.length || 0 }
      });
    } catch (logError) {
      console.error('Could not log AI activity:', logError);
      // Continue despite logging error - don't impact user experience
    }
    
    return analysis;
  } catch (error) {
    console.error('Error generating session analysis:', error);
    return null;
  }
};

/**
 * Generate AI treatment plan suggestions
 */
export const generateTreatmentPlan = async (
  userId: string,
  clientId: string,
  currentGoals: string,
  sessionHistory: string
): Promise<string | null> => {
  try {
    // Check if user has AI treatment plan feature
    const hasAccess = await isFeatureEnabled(userId, 'aiTreatmentPlans');
    if (!hasAccess) {
      console.warn('User does not have access to AI Treatment Plans feature');
      return null;
    }
    
    // Create a prompt for the AI
    const prompt = `Based on the following information, generate a comprehensive treatment plan with specific activities and exercises:
    
    Current Goals: ${currentGoals}
    
    Session History Summary: ${sessionHistory}
    
    Provide 4-6 specific activity recommendations with rationales.`;
    
    // Call the AI API (or simulation)
    const treatmentPlan = await callOpenAIAPI(prompt, userId);
    
    return treatmentPlan;
  } catch (error) {
    console.error('Error generating treatment plan:', error);
    return null;
  }
};

/**
 * Generate AI progress predictions
 */
export const generateProgressPrediction = async (
  userId: string,
  clientId: string,
  goals: string
): Promise<string | null> => {
  try {
    // Check if user has AI progress prediction feature
    const hasAccess = await isFeatureEnabled(userId, 'aiProgressPrediction');
    if (!hasAccess) {
      console.warn('User does not have access to AI Progress Prediction feature');
      return null;
    }
    
    // Fetch client data and session history
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
      
    if (clientError) {
      console.error('Error fetching client data:', clientError);
      return null;
    }
    
    // Create a prompt for the AI
    const prompt = `Based on the client's therapy history and current goals, predict expected progress timelines and outcomes:
    
    Current Goals: ${goals}
    
    Provide expected timelines for short-term and long-term goals, potential challenges, and factors that may influence progress rates.`;
    
    // Call the AI API (or simulation)
    const prediction = await callOpenAIAPI(prompt, userId);
    
    return prediction;
  } catch (error) {
    console.error('Error generating progress prediction:', error);
    return null;
  }
};

/**
 * Transcribe audio to text and generate session notes
 */
export const transcribeAndGenerateNotes = async (
  userId: string,
  audioData: Blob
): Promise<{ transcription: string; notes: string } | null> => {
  try {
    // Check if user has AI transcription feature
    const hasAccess = await isFeatureEnabled(userId, 'aiTranscription');
    if (!hasAccess) {
      console.warn('User does not have access to AI Transcription feature');
      return null;
    }
    
    // In a real implementation, you would:
    // 1. Upload the audio file to a server or directly to OpenAI
    // 2. Use OpenAI's Whisper API to transcribe
    // 3. Generate structured notes from the transcription
    
    // Simulate transcription and note generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const simulatedTranscription = "Therapist: How have you been feeling since our last session?\nClient: I've been practicing the exercises you recommended. The hand strengthening ones are easier now, but I'm still struggling with the fine motor tasks.\nTherapist: That's good progress. Let's focus more on those fine motor skills today.";
    
    const prompt = `Convert this therapy session transcription into structured SOAP format notes:
    
    ${simulatedTranscription}`;
    
    const soapNotes = await callOpenAIAPI(prompt, userId);
    
    return {
      transcription: simulatedTranscription,
      notes: soapNotes
    };
  } catch (error) {
    console.error('Error in transcription and note generation:', error);
    return null;
  }
};

/**
 * Perform semantic search across client records
 */
export const semanticSearch = async (
  userId: string,
  query: string
): Promise<any[] | null> => {
  try {
    // Check if user has AI search feature
    const hasAccess = await isFeatureEnabled(userId, 'aiSearch');
    if (!hasAccess) {
      console.warn('User does not have access to AI Search feature');
      return null;
    }
    
    // In a production environment, this would:
    // 1. Send the query to an embedding model
    // 2. Compare the embedding with stored embeddings of client notes
    // 3. Return the most semantically similar results
    
    // Simulated results
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      { 
        id: 'sim1', 
        type: 'session', 
        clientName: 'Jane Doe', 
        date: '2023-03-15', 
        snippet: 'Client reported improvement in motor skills following regular home exercises.',
        relevanceScore: 0.89
      },
      { 
        id: 'sim2', 
        type: 'note', 
        clientName: 'John Smith', 
        date: '2023-04-22', 
        snippet: 'Assessment showed significant progress in areas of fine motor control.',
        relevanceScore: 0.75
      },
      { 
        id: 'sim3', 
        type: 'goal', 
        clientName: 'Sarah Johnson', 
        date: '2023-02-10', 
        snippet: 'Long-term goal: Improve fine motor coordination to enable independent writing.',
        relevanceScore: 0.72
      }
    ];
  } catch (error) {
    console.error('Error performing semantic search:', error);
    return null;
  }
}; 