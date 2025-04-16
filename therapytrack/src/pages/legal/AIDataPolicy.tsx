import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';

const AIDataPolicy: React.FC = () => {
  return (
    <PageLayout>
      <div className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">AI Data Handling Policy</h1>
            <p className="mt-4 text-lg text-gray-500">Last updated: July 15, 2023</p>
          </div>
          
          <div className="mt-12 prose prose-primary prose-lg mx-auto">
            <h2>Introduction</h2>
            <p>
              This AI Data Handling Policy is a supplement to our main Privacy Policy and specifically addresses 
              how TherapyTrack handles patient data when using artificial intelligence (AI) features. 
              We are committed to maintaining the highest standards of HIPAA compliance while providing 
              innovative AI-powered tools to enhance therapy services.
            </p>
            
            <h2>AI Features Overview</h2>
            <p>
              TherapyTrack offers several AI-powered features in our Premium subscription tier, including:
            </p>
            <ul>
              <li><strong>Session Analysis:</strong> AI-generated insights and patterns from therapy session history</li>
              <li><strong>Treatment Plan Generation:</strong> AI-suggested treatment activities and exercises</li>
              <li><strong>Progress Prediction:</strong> AI forecasts of expected progress timelines</li>
              <li><strong>Voice-to-Notes Transcription:</strong> Converting recorded sessions to text and structured notes</li>
            </ul>
            
            <h2>HIPAA Compliance Framework</h2>
            <p>
              All AI features in TherapyTrack are designed with HIPAA compliance as a foundational requirement. 
              Our approach includes:
            </p>
            <ul>
              <li><strong>Business Associate Agreements (BAAs):</strong> We maintain BAAs with all AI service providers</li>
              <li><strong>Data De-identification:</strong> Patient data is de-identified before processing by external AI services</li>
              <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
              <li><strong>Audit Logging:</strong> Comprehensive logs of all AI-related activities are maintained</li>
              <li><strong>User Controls:</strong> Therapists maintain full control over AI feature usage</li>
            </ul>
            
            <h2>Data De-identification Process</h2>
            <p>
              Before any patient data is processed by AI services, we apply a rigorous de-identification process following 
              the HIPAA Safe Harbor method, which removes 18 types of identifiers:
            </p>
            <ul>
              <li>Names of patients and relatives</li>
              <li>Geographic identifiers smaller than a state</li>
              <li>Dates directly related to an individual (birth, admission, discharge, death)</li>
              <li>Telephone numbers</li>
              <li>Email addresses</li>
              <li>Medical record numbers</li>
              <li>Account numbers</li>
              <li>Social security numbers</li>
              <li>Device identifiers and serial numbers</li>
              <li>And other identifiers as specified by HIPAA</li>
            </ul>
            
            <h2>AI Service Provider Requirements</h2>
            <p>
              We carefully select AI service providers based on their ability to meet our stringent data protection requirements:
            </p>
            <ul>
              <li>Willingness to sign a Business Associate Agreement (BAA)</li>
              <li>SOC 2 Type II compliance or equivalent security certifications</li>
              <li>Data processing exclusively within HIPAA-compliant environments</li>
              <li>Commitment not to use client data for training AI models</li>
              <li>Clear data deletion policies with confirmation mechanisms</li>
              <li>Transparent data handling practices</li>
            </ul>
            
            <h2>User Controls and Transparency</h2>
            <p>
              TherapyTrack gives therapists comprehensive control over AI features:
            </p>
            <ul>
              <li><strong>Global AI Toggle:</strong> Enable or disable all AI features with a single setting</li>
              <li><strong>Feature-Specific Controls:</strong> Enable or disable individual AI features</li>
              <li><strong>Client-Specific Exclusions:</strong> Exclude specific clients from all AI processing</li>
              <li><strong>Visual Indicators:</strong> Clear visual cues when AI features are active</li>
              <li><strong>Processing Transparency:</strong> Information about what data is being processed and how</li>
              <li><strong>Audit Trail:</strong> View history of AI feature usage in your account</li>
            </ul>
            
            <h2>AI Processing Workflow</h2>
            <p>
              When you use an AI feature in TherapyTrack, the following process occurs:
            </p>
            <ol>
              <li>You initiate an AI feature (e.g., request a session analysis)</li>
              <li>Our system checks your account permissions and client-specific exclusions</li>
              <li>Relevant data is retrieved from our secure database</li>
              <li>The data undergoes thorough de-identification to remove all PHI</li>
              <li>The de-identified data is sent to the AI service via encrypted connection</li>
              <li>The AI service processes the data and returns results</li>
              <li>Results are stored in your account with the same security as all patient data</li>
              <li>The activity is logged for audit purposes</li>
              <li>De-identified data is not retained by the AI service beyond the immediate processing required</li>
            </ol>
            
            <h2>Data Retention</h2>
            <p>
              Our data retention practices for AI-processed information include:
            </p>
            <ul>
              <li>AI processing results are stored according to the same retention policy as all patient records</li>
              <li>Raw de-identified data sent to AI services is not retained by those services beyond processing</li>
              <li>Audit logs of AI usage are retained for a minimum of six years as required by HIPAA</li>
            </ul>
            
            <h2>Third-Party AI Services</h2>
            <p>
              TherapyTrack currently uses the following AI service providers:
            </p>
            <ul>
              <li><strong>OpenAI (GPT-4):</strong> For text analysis, treatment planning, and notes generation</li>
              <li><strong>OpenAI Whisper:</strong> For speech-to-text transcription</li>
            </ul>
            <p>
              All providers have signed Business Associate Agreements (BAAs) with TherapyTrack and 
              are contractually obligated to handle de-identified data in accordance with HIPAA requirements.
            </p>
            
            <h2>Security Incident Response</h2>
            <p>
              In the unlikely event of a security incident involving AI-processed data:
            </p>
            <ul>
              <li>We will investigate the incident immediately</li>
              <li>We will notify affected users in accordance with HIPAA Breach Notification requirements</li>
              <li>We will work with affected parties to mitigate any potential harm</li>
              <li>We will review and update our security practices to prevent similar incidents</li>
            </ul>
            
            <h2>Updating This Policy</h2>
            <p>
              We may update this AI Data Handling Policy from time to time to reflect changes in our practices or regulatory requirements. 
              Significant changes will be communicated to users through notifications within the application.
            </p>
            
            <h2>Contact Information</h2>
            <p>
              If you have questions or concerns about our AI data handling practices, please contact our Privacy Officer at:
            </p>
            <p>
              Email: privacy@therapytrack.com<br />
              Phone: (555) 123-4567<br />
              Address: 123 Main Street, Suite 200, Anytown, CA 12345
            </p>
            
            <div className="mt-8 flex space-x-4">
              <Link to="/legal/privacy" className="text-primary-600 hover:text-primary-500">
                View our Privacy Policy
              </Link>
              <Link to="/legal/terms" className="text-primary-600 hover:text-primary-500">
                View our Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AIDataPolicy; 