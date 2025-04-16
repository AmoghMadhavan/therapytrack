import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';

interface ComplianceDocHubProps {
  className?: string;
}

const ComplianceDocHub: React.FC<ComplianceDocHubProps> = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const recentUpdates = [
    { title: "HIPAA Privacy Policy", date: "May 15, 2023", route: "/compliance/hipaa/privacy-policy" },
    { title: "AI Ethics Guidelines", date: "May 10, 2023", route: "/compliance/ai/ethics-guidelines" },
    { title: "Password Policy", date: "May 5, 2023", route: "/compliance/security/password-policy" },
    { title: "Consent Forms", date: "April 28, 2023", route: "/compliance/forms/consent" },
  ];
  
  const complianceDocs = [
    {
      category: "HIPAA Compliance",
      icon: <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      items: [
        { title: "HIPAA Privacy Policy", description: "Overview of our privacy practices", route: "/compliance/hipaa/privacy-policy" },
        { title: "Security Rule Compliance", description: "Technical safeguards documentation", route: "/compliance/hipaa/security-rule" },
        { title: "Patient Rights", description: "HIPAA patient rights and procedures", route: "/compliance/hipaa/patient-rights" },
        { title: "Breach Notification", description: "Procedures for breach notifications", route: "/compliance/hipaa/breach-notification" },
      ]
    },
    {
      category: "Security Policies",
      icon: <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
      items: [
        { title: "Password Policy", description: "Requirements for secure passwords", route: "/compliance/security/password-policy" },
        { title: "Access Control", description: "User access management procedures", route: "/compliance/security/access-control" },
        { title: "Data Encryption", description: "Data encryption standards", route: "/compliance/security/encryption" },
        { title: "Incident Response", description: "Security incident handling", route: "/compliance/security/incident-response" },
      ]
    },
    {
      category: "AI & Technology",
      icon: <svg className="h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
      items: [
        { title: "AI Ethics Guidelines", description: "Ethical use of AI in therapy", route: "/compliance/ai/ethics-guidelines" },
        { title: "Technology Security", description: "Technology security requirements", route: "/compliance/ai/technology-security" },
        { title: "Data Processing", description: "AI data processing procedures", route: "/compliance/ai/data-processing" },
      ]
    },
    {
      category: "Forms & Templates",
      icon: <svg className="h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
      items: [
        { title: "Consent Forms", description: "Patient consent templates", route: "/compliance/forms/consent" },
        { title: "Risk Assessment", description: "Security risk assessment forms", route: "/compliance/forms/risk-assessment" },
        { title: "Audit Templates", description: "Security audit templates", route: "/compliance/forms/audit-templates" },
      ]
    },
  ];

  const navigateToDoc = (route: string) => {
    navigate(route);
  };

  const renderContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <h3 className="font-bold text-lg">Recently Updated</h3>
              </div>
              <p className="text-gray-500 text-sm">Documents updated in the last 30 days</p>
            </div>
            <div>
              <ul className="space-y-3">
                {recentUpdates.map((doc, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <Link 
                      to={doc.route}
                      className="text-blue-600 hover:underline"
                    >
                      {doc.title}
                    </Link>
                    <span className="text-sm text-gray-500">{doc.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <h3 className="font-bold text-lg">Compliance Check Reminder</h3>
              </div>
              <p className="text-gray-500 text-sm">Next scheduled compliance review</p>
            </div>
            <div className="space-y-4">
              <p className="text-sm">Your next quarterly compliance check is due on <strong>June 30, 2023</strong></p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Required activities:</p>
                <ul className="text-sm space-y-1">
                  <li>• HIPAA Security Risk Assessment</li>
                  <li>• Access Control Audit</li>
                  <li>• Staff Training Verification</li>
                </ul>
              </div>
              <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-sm">Schedule Review</button>
            </div>
          </div>
        </div>
      );
    }
    
    const categoryDocs = complianceDocs.find(cat => cat.category.toLowerCase() === activeTab.toLowerCase());
    
    if (!categoryDocs) return null;
    
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categoryDocs.items.map((item, index) => (
          <div 
            key={index} 
            className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigateToDoc(item.route)}
          >
            <h3 className="font-bold text-lg">{item.title}</h3>
            <p className="text-gray-500 text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Compliance Documentation</h2>
          <p className="text-gray-500">
            Access and manage all compliance-related documents and policies
          </p>
        </div>
        
        <div>
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              
              {complianceDocs.map((category, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(category.category.toLowerCase())}
                  className={`${
                    activeTab === category.category.toLowerCase()
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <span className="flex items-center gap-1">
                    {category.icon}
                    {category.category}
                  </span>
                </button>
              ))}
            </nav>
          </div>
          
          <div>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDocHub;