import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../contexts/SupabaseAuthContext';

// Mock client data for development
const mockClients = [
  {
    id: '1',
    firstName: 'Jane',
    lastName: 'Smith',
    diagnosis: ['Speech Delay', 'Developmental Coordination Disorder'],
    status: 'active',
    lastSessionDate: new Date('2023-06-01').toISOString(),
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Johnson',
    diagnosis: ['Autism Spectrum Disorder', 'Sensory Processing'],
    status: 'active',
    lastSessionDate: new Date('2023-05-28').toISOString(),
  },
  {
    id: '3',
    firstName: 'Emma',
    lastName: 'Wilson',
    diagnosis: ['Fine Motor Delay', 'Visual Processing'],
    status: 'active',
    lastSessionDate: new Date('2023-05-25').toISOString(),
  },
  {
    id: '4',
    firstName: 'Thomas',
    lastName: 'Brown',
    diagnosis: ['Speech Articulation', 'Language Delay'],
    status: 'active',
    lastSessionDate: new Date('2023-05-20').toISOString(),
  },
  {
    id: '5',
    firstName: 'Sophia',
    lastName: 'Davis',
    diagnosis: ['Developmental Coordination Disorder'],
    status: 'inactive',
    lastSessionDate: new Date('2023-04-15').toISOString(),
  },
];

const Clients: React.FC = () => {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState(mockClients);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // This would be replaced with a Supabase fetch
    setLoading(false);
  }, []);

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.diagnosis.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <PageLayout>
      <div className="py-10">
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">Clients</h1>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link
                to="/clients/new"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Add Client
              </Link>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="flex flex-col sm:flex-row justify-between mb-6">
                <div className="w-full sm:w-1/3 mb-4 sm:mb-0">
                  <label htmlFor="search" className="sr-only">
                    Search clients
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="search"
                      id="search"
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Search clients"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full sm:w-1/4">
                  <select
                    id="status"
                    name="status"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Clients</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <li key={client.id}>
                          <Link to={`/clients/${client.id}`} className="block hover:bg-gray-50">
                            <div className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-primary-600 truncate">
                                  {client.firstName} {client.lastName}
                                </p>
                                <div className="ml-2 flex-shrink-0 flex">
                                  <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    client.status === 'active' 
                                      ? 'bg-green-100 text-green-800' 
                                      : client.status === 'inactive' 
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {client.diagnosis.join(', ')}
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p>
                                    Last session: {new Date(client.lastSessionDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-6 text-center text-gray-500">
                        No clients found matching your criteria.
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </PageLayout>
  );
};

export default Clients; 