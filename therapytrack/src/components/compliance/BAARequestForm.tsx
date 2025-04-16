import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../lib/supabase/config';

interface BAARequestFormProps {
  className?: string;
}

const BAARequestForm: React.FC<BAARequestFormProps> = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    organizationName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    organizationAddress: '',
    organizationType: 'healthcare_provider',
    additionalNotes: '',
    agreesToTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreesToTerms) {
      setSubmitResult({
        success: false,
        message: 'You must agree to the terms before submitting.'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitResult(null);
      
      // Save BAA request to database
      const { error } = await supabase
        .from('baa_requests')
        .insert([
          {
            user_id: currentUser?.id,
            organization_name: formData.organizationName,
            contact_name: formData.contactName,
            contact_email: formData.contactEmail,
            contact_phone: formData.contactPhone,
            organization_address: formData.organizationAddress,
            organization_type: formData.organizationType,
            additional_notes: formData.additionalNotes,
            status: 'pending'
          }
        ]);
      
      if (error) throw error;
      
      // Log this activity
      await supabase
        .from('activity_logs')
        .insert([
          {
            user_id: currentUser?.id,
            activity_type: 'baa_request_submitted',
            details: { organization: formData.organizationName }
          }
        ]);
      
      setSubmitResult({
        success: true,
        message: 'Your BAA request has been submitted. Our team will contact you shortly to proceed with the agreement process.'
      });
      
      // Reset form
      setFormData({
        organizationName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        organizationAddress: '',
        organizationType: 'healthcare_provider',
        additionalNotes: '',
        agreesToTerms: false
      });
      
    } catch (error) {
      console.error('Error submitting BAA request:', error);
      setSubmitResult({
        success: false,
        message: 'There was an error submitting your request. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Business Associate Agreement (BAA) Request
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Submit this form to request a Business Associate Agreement with OpenAI for HIPAA compliance
        </p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {submitResult && (
          <div className={`mb-4 p-4 rounded-md ${submitResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {submitResult.success ? (
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${submitResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {submitResult.message}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="organizationName"
                  id="organizationName"
                  required
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="contactName"
                  id="contactName"
                  required
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="contactEmail"
                  id="contactEmail"
                  required
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  name="contactPhone"
                  id="contactPhone"
                  required
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700">
                Organization Type <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="organizationType"
                  name="organizationType"
                  required
                  value={formData.organizationType}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="healthcare_provider">Healthcare Provider</option>
                  <option value="health_plan">Health Plan</option>
                  <option value="healthcare_clearinghouse">Healthcare Clearinghouse</option>
                  <option value="business_associate">Business Associate</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="organizationAddress" className="block text-sm font-medium text-gray-700">
                Organization Address <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="organizationAddress"
                  id="organizationAddress"
                  required
                  value={formData.organizationAddress}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <div className="mt-1">
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  rows={4}
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Please include any specific requirements or questions regarding the BAA
              </p>
            </div>
          </div>

          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreesToTerms"
                name="agreesToTerms"
                type="checkbox"
                checked={formData.agreesToTerms}
                onChange={handleInputChange}
                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreesToTerms" className="font-medium text-gray-700">
                I understand and confirm <span className="text-red-500">*</span>
              </label>
              <p className="text-gray-500">
                By submitting this form, I confirm that my organization is a HIPAA-covered entity or business associate
                and requires a Business Associate Agreement (BAA) with OpenAI to process protected health information (PHI).
              </p>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">What is a Business Associate Agreement (BAA)?</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                A Business Associate Agreement (BAA) is a legal contract required by HIPAA when a covered entity shares protected health information (PHI) with a third party. For AI services like those provided by OpenAI, a BAA is necessary to ensure HIPAA compliance when processing or storing patient data.
              </p>
              <p className="mt-2">
                Upon submitting this form, our team will initiate the BAA process with OpenAI on your behalf. The standard OpenAI BAA may require additional technical safeguards beyond what is already implemented in our application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BAARequestForm; 