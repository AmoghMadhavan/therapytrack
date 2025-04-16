import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';

interface AIUsagePolicyProps {
  className?: string;
}

const AIUsagePolicy: React.FC<AIUsagePolicyProps> = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const lastUpdated = '2023-11-15';

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            AI Usage Policy for HIPAA Compliance
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Last updated: {lastUpdated}
          </p>
        </div>
        <div>
          <button
            type="button"
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => window.print()}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" 
              />
            </svg>
            Print
          </button>
        </div>
      </div>
      
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Policy Scope
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              This policy applies to all therapists, administrative staff, contractors, and other authorized users who utilize AI-powered features within our platform for clinical, administrative, or operational purposes.
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Purpose
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              To establish guidelines for the safe, ethical, and HIPAA-compliant use of artificial intelligence tools within our mental health practice management platform, ensuring the protection of protected health information (PHI) and maintaining patient confidentiality.
            </dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              HIPAA Compliance Statement
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <p>
                All AI features within our platform have been developed and implemented in accordance with HIPAA requirements. When AI processing involves PHI, the following safeguards are in place:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>All PHI is encrypted in transit and at rest</li>
                <li>Business Associate Agreements (BAAs) are maintained with all AI service providers</li>
                <li>AI processing is subject to the same access controls and audit trails as other PHI</li>
                <li>AI models are trained on de-identified data where possible</li>
                <li>Regular risk assessments of AI features are conducted</li>
              </ul>
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Acceptable Use
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Permitted AI Use Cases:</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Automated clinical note summarization and organization</li>
                    <li>Treatment plan suggestions based on evidence-based practices</li>
                    <li>Administrative task automation (scheduling, billing coding assistance)</li>
                    <li>Documentation improvement suggestions</li>
                    <li>Clinical research assistance using de-identified data</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium">Prohibited AI Use Cases:</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Autonomous clinical decision-making without human oversight</li>
                    <li>Sharing raw patient data with non-BAA covered AI services</li>
                    <li>Using AI features to generate fabricated clinical documentation</li>
                    <li>Bypassing platform security features to access AI capabilities</li>
                    <li>Using AI to analyze patient data for non-treatment purposes without explicit consent</li>
                  </ul>
                </div>
              </div>
            </dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Data Protection Controls
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div className="space-y-4">
                <p>
                  The following controls are implemented to protect PHI when using AI features:
                </p>
                
                <div>
                  <h4 className="font-medium">Technical Safeguards:</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>End-to-end encryption for all AI data processing</li>
                    <li>Strict API authentication and authorization</li>
                    <li>Role-based access controls for AI features</li>
                    <li>Automatic PHI detection and redaction when needed</li>
                    <li>Comprehensive audit logging of all AI interactions</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium">Administrative Safeguards:</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Regular training on AI usage policies</li>
                    <li>Periodic review of AI vendor compliance</li>
                    <li>AI risk assessments as part of the overall security risk analysis</li>
                    <li>Documentation of all AI features in the organization's HIPAA policies</li>
                    <li>AI incident response procedures</li>
                  </ul>
                </div>
              </div>
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Patient Consent Requirements
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <p>
                While AI tools used for treatment, payment, and healthcare operations fall under permitted uses under HIPAA, our policy requires:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Clear disclosure to patients about the use of AI in their care through updated Notice of Privacy Practices</li>
                <li>Explicit consent when AI is used for purposes beyond standard treatment and operations</li>
                <li>Patient option to opt-out of specific AI-assisted features</li>
                <li>Documentation of patient preferences regarding AI usage</li>
              </ul>
            </dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Incident Response
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <p>
                In the event of an AI-related privacy or security incident:
              </p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Immediately report the incident to the Privacy Officer</li>
                <li>Disable the affected AI feature if necessary</li>
                <li>Document the nature and extent of the incident</li>
                <li>Follow the organization's breach notification policy if PHI is compromised</li>
                <li>Conduct a root cause analysis</li>
                <li>Implement corrective measures before re-enabling the AI feature</li>
              </ol>
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Monitoring and Auditing
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <p>
                All AI feature usage is subject to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Comprehensive audit logging of access and usage</li>
                <li>Regular review of AI usage patterns</li>
                <li>Automated alerts for unusual usage patterns</li>
                <li>Quarterly compliance reviews of AI features</li>
                <li>Annual assessment of AI-related risks</li>
              </ul>
            </dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Staff Training Requirements
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <p>
                All users with access to AI features must complete:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Initial training on this AI Usage Policy</li>
                <li>Annual refresher training</li>
                <li>Specific feature training when new AI capabilities are added</li>
                <li>Documentation of all completed training</li>
              </ul>
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Policy Enforcement
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <p>
                Violations of this policy may result in:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Temporary suspension of AI feature access</li>
                <li>Additional mandatory training</li>
                <li>Disciplinary action according to organizational policies</li>
                <li>Termination of employment or contract for serious violations</li>
                <li>Legal action where violations violate HIPAA or other regulations</li>
              </ul>
            </dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Policy Review and Updates
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <p>
                This policy will be reviewed and updated:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>At least annually</li>
                <li>When new AI features are implemented</li>
                <li>After any AI-related incident</li>
                <li>When relevant regulations or guidance changes</li>
                <li>As recommended by the Privacy or Security Officer</li>
              </ul>
            </dd>
          </div>
        </dl>
      </div>
      
      <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Acknowledgment</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                By using the AI-powered features of this platform, you acknowledge that you have read and agreed to comply with this AI Usage Policy. For questions or concerns about this policy, please contact the Privacy Officer.
              </p>
              <p className="mt-3">
                This policy is part of our broader HIPAA compliance program and should be read in conjunction with all other privacy and security policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIUsagePolicy; 