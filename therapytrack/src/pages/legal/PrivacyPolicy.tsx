import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';

const PrivacyPolicy: React.FC = () => {
  return (
    <PageLayout>
      <div className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Privacy Policy</h1>
            <p className="mt-4 text-lg text-gray-500">Last updated: June 15, 2023</p>
          </div>
          
          <div className="mt-12 prose prose-primary prose-lg mx-auto">
            <h2>Introduction</h2>
            <p>
              TherapyTrack ("we," "our," or "us") is committed to protecting the privacy and security of your personal information and health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            <p>
              TherapyTrack is designed to be compliant with the Health Insurance Portability and Accountability Act (HIPAA) and other applicable privacy laws. As a covered entity under HIPAA, we are required to maintain the privacy and security of your protected health information (PHI) and to provide you with notice of our legal duties and privacy practices with respect to your PHI.
            </p>
            
            <h2>Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul>
              <li><strong>Personal Identification Information:</strong> Name, email address, phone number, date of birth, and other contact information.</li>
              <li><strong>Health Information:</strong> Medical history, diagnoses, treatment plans, progress notes, assessment results, and other health-related information.</li>
              <li><strong>Technical Information:</strong> Device information, IP address, browser type, operating system, and usage data.</li>
              <li><strong>Payment Information:</strong> Credit card details, billing address, and other financial information necessary for payment processing.</li>
            </ul>
            
            <h2>How We Use Your Information</h2>
            <p>We may use your information for the following purposes:</p>
            <ul>
              <li>To provide and manage the services you request</li>
              <li>To communicate with you about your therapy progress, appointments, and treatment plans</li>
              <li>To improve our services and develop new features</li>
              <li>To process payments and manage billing</li>
              <li>To comply with legal and regulatory requirements</li>
              <li>To respond to your inquiries and support requests</li>
            </ul>
            
            <h2>HIPAA Compliance and Protected Health Information</h2>
            <p>
              As a covered entity under HIPAA, we are committed to protecting the privacy and security of your protected health information (PHI). We implement administrative, physical, and technical safeguards to protect your PHI from unauthorized access, use, or disclosure.
            </p>
            <p>
              We may use or disclose your PHI for treatment, payment, and healthcare operations purposes as permitted by HIPAA. We will obtain your authorization before using or disclosing your PHI for purposes other than those permitted by HIPAA, unless an exception applies.
            </p>
            
            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your information, including:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Access controls and authentication measures</li>
              <li>Regular security assessments and audits</li>
              <li>Business continuity and disaster recovery plans</li>
              <li>Employee training on privacy and security practices</li>
            </ul>
            <p>
              Despite our efforts, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security of your information.
            </p>
            
            <h2>Your Rights Under HIPAA</h2>
            <p>You have the following rights regarding your PHI:</p>
            <ul>
              <li>Right to access and receive a copy of your PHI</li>
              <li>Right to request amendments to your PHI</li>
              <li>Right to receive an accounting of certain disclosures of your PHI</li>
              <li>Right to request restrictions on certain uses and disclosures of your PHI</li>
              <li>Right to request confidential communications</li>
              <li>Right to receive notice of a breach of unsecured PHI</li>
              <li>Right to file a complaint if you believe your privacy rights have been violated</li>
            </ul>
            
            <h2>Data Retention</h2>
            <p>
              We retain your information for as long as needed to provide you with our services, comply with our legal obligations, resolve disputes, and enforce our agreements. For PHI, we follow the retention requirements specified by applicable healthcare laws and regulations.
            </p>
            
            <h2>Third-Party Service Providers</h2>
            <p>
              We may share your information with third-party service providers who assist us in providing our services. These providers are bound by confidentiality agreements and are not permitted to use your information for any other purpose. All third-party vendors who may have access to PHI are required to sign Business Associate Agreements (BAAs) in compliance with HIPAA requirements.
            </p>
            
            <h2>Artificial Intelligence and Machine Learning Features</h2>
            <p>
              TherapyTrack offers AI-powered features in premium subscription tiers that may process patient data to provide enhanced services such as session analysis, treatment plan generation, progress predictions, and transcription services.
            </p>
            
            <h3>How We Use AI with Your Data</h3>
            <p>
              When you use our AI-powered features, we adhere to the following principles:
            </p>
            <ul>
              <li><strong>De-identification:</strong> Before any patient data is processed by external AI services, we apply rigorous de-identification procedures to remove all Protected Health Information (PHI) as defined by HIPAA. This includes removing names, contact information, dates, addresses, and other identifiers.</li>
              <li><strong>Data Minimization:</strong> We only process the minimum data necessary to provide the requested AI feature.</li>
              <li><strong>Transparency:</strong> Our application clearly indicates when AI features are being used and what data will be processed.</li>
              <li><strong>Opt-out Options:</strong> Therapists can choose to disable AI features entirely or for specific clients/sessions.</li>
              <li><strong>No Training:</strong> We have agreements with our AI service providers ensuring that your de-identified data will not be used to train or improve their models.</li>
            </ul>
            
            <h3>AI Service Provider Compliance</h3>
            <p>
              We only work with AI service providers who:
            </p>
            <ul>
              <li>Have signed a Business Associate Agreement (BAA) with us</li>
              <li>Maintain their own HIPAA compliance programs</li>
              <li>Implement appropriate security measures to protect data in transit and at rest</li>
              <li>Have clear data deletion policies</li>
              <li>Do not retain data longer than necessary to provide the requested service</li>
            </ul>
            
            <h3>AI Data Retention</h3>
            <p>
              We maintain the following data retention practices for AI-processed information:
            </p>
            <ul>
              <li>AI processing results (e.g., generated treatment plans, transcriptions) are stored in your account with the same encryption and security measures as all other patient data</li>
              <li>De-identified data sent to AI services is not retained by the service provider beyond the immediate processing required</li>
              <li>We maintain detailed logs of all AI feature usage for audit and compliance purposes</li>
            </ul>
            
            <h2>Changes to this Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
            
            <h2>Contact Information</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact our Privacy Officer at:
            </p>
            <p>
              Email: privacy@therapytrack.com<br />
              Phone: (555) 123-4567<br />
              Address: 123 Main Street, Suite 200, Anytown, CA 12345
            </p>
            
            <div className="mt-8">
              <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                View our Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PrivacyPolicy; 