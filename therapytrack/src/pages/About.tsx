import React from 'react';
import PageLayout from '../components/layout/PageLayout';

const About: React.FC = () => {
  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About Theriq</h1>
          
          <div className="prose prose-indigo max-w-none">
            <p className="text-lg mb-6">
              Theriq is a comprehensive therapy practice management platform designed specifically for 
              independent occupational and speech therapists. Our mission is to empower therapists with 
              the tools they need to provide exceptional care while minimizing administrative burden.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Mission</h2>
            <p className="mb-6">
              We believe that therapists should spend more time helping patients and less time on paperwork. 
              Theriq streamlines practice management so therapists can focus on what they do best—changing lives.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Key Features</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Client management with comprehensive profiles and progress tracking</li>
              <li>Secure, HIPAA-compliant session documentation</li>
              <li>Goal setting and outcome measurement</li>
              <li>Exercise library and home program assignment</li>
              <li>Scheduling and appointment reminders</li>
              <li>Customizable assessment templates</li>
              <li>Secure messaging with clients and caretakers</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Team</h2>
            <p className="mb-6">
              Theriq was developed by technology enthusiasts passionate about improving healthcare delivery. 
              We plan to work closely with therapists to understand their workflow needs and challenges, ensuring our 
              platform will deliver real-world value to therapy practices.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Privacy & Security</h2>
            <p className="mb-6">
              We take data privacy and security seriously. Theriq is built with HIPAA compliance in mind, 
              featuring end-to-end encryption, secure authentication, and comprehensive audit trails. 
              Your data—and your clients' data—is safe with us.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Join Us</h2>
            <p className="mb-6">
              Whether you're a solo practitioner or running a small practice, Theriq provides the tools you 
              need to grow your business while providing exceptional client care. Try it today and see how 
              we can transform your therapy practice.
            </p>
            
            <p className="text-sm text-gray-500 mt-8">
              <strong>Disclaimer:</strong> Theriq is a practice management tool and does not provide medical advice, 
              diagnosis, or treatment. Theriq is not developed, endorsed, or reviewed by healthcare professionals.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default About; 