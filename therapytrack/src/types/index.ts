// Define our own Timestamp interface to replace Firebase's
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
  toMillis: () => number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'therapist' | 'client';
  phoneNumber?: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  subscriptionTier?: 'basic' | 'professional' | 'enterprise';
  subscriptionStatus?: 'active' | 'canceled' | 'trial';
  subscriptionExpiry?: Timestamp;
  settings: {
    notifications: boolean;
    emailAlerts: boolean;
    smsAlerts: boolean;
    theme: 'light' | 'dark' | 'system';
  }
}

export interface Therapist {
  id: string;
  userId: string;
  specialty: string[];
  businessName?: string;
  businessAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  licenseNumber?: string;
  activeClientCount: number;
  subscription: {
    tier: 'basic' | 'professional' | 'enterprise';
    status: 'active' | 'canceled' | 'trial';
    expiry: Timestamp;
    paymentMethod?: string;
  }
}

export interface Client {
  id: string;
  therapistId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Timestamp;
  gender?: string;
  contactInfo: {
    email?: string;
    phone?: string;
    guardianName?: string;
    guardianRelationship?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zip: string;
    }
  };
  diagnosis: string[];
  notes: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: Timestamp;
  lastSessionDate?: Timestamp;
  goalAreas: string[];
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    authorizationDetails: string;
  };
  profilePhotoURL?: string;
}

export interface Session {
  id: string;
  clientId: string;
  therapistId: string;
  date: Timestamp;
  duration: number;
  status: 'scheduled' | 'completed' | 'canceled' | 'no-show';
  location: 'clinic' | 'school' | 'home' | 'telehealth';
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  attachments: {
    id: string;
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    name: string;
    uploadedAt: Timestamp;
  }[];
  sentToClient: boolean;
  privateNotes?: string;
  billingStatus?: 'unbilled' | 'billed' | 'paid';
  billingCode?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Task {
  id: string;
  clientId: string;
  therapistId: string;
  title: string;
  description: string;
  createdAt: Timestamp;
  assignedDate: Timestamp;
  dueDate: Timestamp;
  status: 'assigned' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  completionDetails?: {
    completedDate: Timestamp;
    notes: string;
    rating?: number;
  };
  attachments: {
    id: string;
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    name: string;
    uploadedAt: Timestamp;
  }[];
  submissions: {
    id: string;
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    name: string;
    uploadedAt: Timestamp;
    notes?: string;
  }[];
  reminderSent: boolean;
  frequency?: 'once' | 'daily' | 'weekly';
  goalArea: string[];
  sessionId?: string;
} 