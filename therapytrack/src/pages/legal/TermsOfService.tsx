import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';

const TermsOfService: React.FC = () => {
  return (
    <PageLayout>
      <div className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Terms of Service</h1>
            <p className="mt-4 text-lg text-gray-500">Last updated: June 15, 2023</p>
          </div>
          
          <div className="mt-12 prose prose-primary prose-lg mx-auto">
            <h2>1. Introduction</h2>
            <p>
              Welcome to TherapyTrack. These Terms of Service ("Terms") govern your use of the TherapyTrack platform and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, do not use our Services.
            </p>
            <p>
              TherapyTrack is a platform designed to facilitate speech therapy practice management, including client information management, therapy session documentation, goal tracking, and secure communication between therapists and clients.
            </p>
            
            <h2>2. Eligibility</h2>
            <p>
              You must be at least 18 years of age to use our Services. By using our Services, you represent and warrant that you meet the eligibility requirements. If you are using the Services on behalf of an entity, organization, or company, you represent and warrant that you have the authority to bind that entity to these Terms.
            </p>
            
            <h2>3. Account Registration</h2>
            <p>
              To access certain features of our Services, you may need to register for an account. When you register, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
            
            <h2>4. Healthcare Provider Obligations</h2>
            <p>
              If you are a healthcare provider using our Services:
            </p>
            <ul>
              <li>You represent and warrant that you hold all necessary licenses, certifications, and credentials required to provide speech therapy services in your jurisdiction.</li>
              <li>You agree to comply with all applicable laws, regulations, and professional standards, including those related to healthcare practice, privacy, and data protection (such as HIPAA).</li>
              <li>You are solely responsible for the care you provide to your clients and for maintaining appropriate clinical documentation.</li>
              <li>You acknowledge that TherapyTrack is a tool to facilitate your practice management and does not provide medical advice, diagnosis, or treatment.</li>
            </ul>
            
            <h2>5. HIPAA Compliance</h2>
            <p>
              TherapyTrack is designed to comply with the Health Insurance Portability and Accountability Act of 1996 (HIPAA) and its implementing regulations. We will enter into a Business Associate Agreement (BAA) with healthcare providers who are Covered Entities under HIPAA. The BAA outlines our obligations with respect to Protected Health Information (PHI).
            </p>
            <p>
              You agree to use the Services in a manner consistent with HIPAA requirements and to comply with any applicable privacy and security policies we provide.
            </p>
            
            <h2>6. User Content</h2>
            <p>
              You retain all rights to any content you submit, post, or display through our Services ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, modify, and display the User Content in connection with providing and improving our Services.
            </p>
            <p>
              You represent and warrant that you have all necessary rights to submit your User Content and that it does not violate any third-party rights or applicable laws.
            </p>
            
            <h2>7. Prohibited Conduct</h2>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Use the Services in any manner that could disable, overburden, damage, or impair the Services or interfere with any other party's use of the Services</li>
              <li>Use any robot, spider, or other automatic device to access the Services</li>
              <li>Introduce any viruses, trojan horses, worms, or other harmful material</li>
              <li>Attempt to gain unauthorized access to the Services or related systems</li>
              <li>Use the Services to transmit any material that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or invasive of another's privacy</li>
              <li>Use the Services for any illegal purpose or in violation of any applicable laws</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with a person or entity</li>
            </ul>
            
            <h2>8. Payment Terms</h2>
            <p>
              Certain aspects of the Services may require payment of fees. All fees are stated in U.S. dollars and are exclusive of any applicable taxes unless otherwise stated.
            </p>
            <p>
              You agree to provide accurate and complete billing information and to pay all fees in a timely manner. Subscription fees are billed in advance on a monthly or annual basis, depending on the subscription plan you select.
            </p>
            <p>
              You may cancel your subscription at any time, but fees are non-refundable except as required by law or as explicitly stated in these Terms.
            </p>
            
            <h2>9. Privacy</h2>
            <p>
              Your privacy is important to us. Our <Link to="/privacy" className="text-primary-600 hover:text-primary-500">Privacy Policy</Link> explains how we collect, use, and protect your information. By using our Services, you agree to our Privacy Policy.
            </p>
            
            <h2>10. Intellectual Property</h2>
            <p>
              The Services and all content, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by TherapyTrack or its licensors and are protected by copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p>
              These Terms do not grant you any rights to use our trademarks, logos, domain names, or other brand features. You may not copy, modify, create derivative works of, publicly display, publicly perform, republish, or transmit any of the material on our Services without our prior written consent.
            </p>
            
            <h2>11. Disclaimer of Warranties</h2>
            <p>
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICES OR THE SERVERS THAT MAKE THEM AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
            <p>
              THERAPYTRACK IS NOT A HEALTHCARE PROVIDER AND DOES NOT PROVIDE MEDICAL ADVICE, DIAGNOSIS, OR TREATMENT. THE SERVICES ARE TOOLS TO FACILITATE PRACTICE MANAGEMENT AND DO NOT REPLACE PROFESSIONAL MEDICAL JUDGMENT.
            </p>
            
            <h2>12. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THERAPYTRACK, ITS AFFILIATES, AND THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, SUPPLIERS, AND LICENSORS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (i) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES; (ii) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES; (iii) ANY CONTENT OBTAINED FROM THE SERVICES; AND (iv) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.
            </p>
            <p>
              IN NO EVENT WILL OUR AGGREGATE LIABILITY EXCEED THE GREATER OF ONE HUNDRED DOLLARS ($100) OR THE AMOUNT YOU HAVE PAID US IN THE PAST TWELVE MONTHS.
            </p>
            
            <h2>13. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless TherapyTrack, its affiliates, and their respective officers, directors, employees, agents, and representatives from and against any claims, liabilities, damages, losses, and expenses, including without limitation reasonable legal and accounting fees, arising out of or in any way connected with your access to or use of the Services, your violation of these Terms, or your violation of any rights of another.
            </p>
            
            <h2>14. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Services at any time, with or without cause, without prior notice or liability. Upon termination, your right to use the Services will immediately cease.
            </p>
            <p>
              All provisions of these Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
            
            <h2>15. Changes to Terms</h2>
            <p>
              We may modify these Terms from time to time. We will notify you of any changes by posting the new Terms on this page and updating the "Last updated" date. You are advised to review these Terms periodically for any changes. Changes to these Terms are effective when they are posted.
            </p>
            <p>
              Your continued use of the Services after the revised Terms are posted constitutes your acceptance of the changes.
            </p>
            
            <h2>16. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. You agree to submit to the personal jurisdiction of the federal and state courts located in San Francisco County, California.
            </p>
            
            <h2>17. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              Email: terms@therapytrack.com<br />
              Phone: (555) 123-4567<br />
              Address: 123 Main Street, Suite 200, Anytown, CA 12345
            </p>
            
            <div className="mt-8">
              <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                View our Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default TermsOfService; 