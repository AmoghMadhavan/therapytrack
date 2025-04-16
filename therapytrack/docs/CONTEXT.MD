# TherapyTrack: Occupational & Speech Therapy Management Platform

## Overview
TherapyTrack is a comprehensive web-based SaaS application designed for independent occupational and speech therapists. It streamlines client management, session tracking, home exercise assignment, and secure client communication within a HIPAA-considerate environment.

## Key Users

### Therapist Portal
- Complete administrative dashboard
- Client profile & session management 
- Task assignment & progress monitoring
- Secure client/guardian messaging

### Client/Parent Portal
- Home exercise/task management
- Progress visualization
- Secure therapist communication
- Simple media uploads for completed tasks

## Core Functionality

### Authentication
- Firebase-powered email/password & Google Sign-In
- Role-based access control

### Therapist Experience

#### Client Management
- Comprehensive client profiles (demographics, diagnosis, contact info)
- Credential management for client/parent access

#### Session Documentation (SOAP Format)
- Structured note-taking with Subjective, Objective, Assessment, Plan sections
- Media attachment capabilities
- Timestamped session history

#### Exercise/Task Assignment
- Detailed task creation with descriptions, deadlines, and attachments
- Client-specific assignments

#### Progress Visualization
- Client-specific timelines and progress graphs
- Task completion analytics
- Optional AI-powered progress summaries

#### Communication Center
- End-to-end secure messaging
- Client-organized conversation history

#### Scheduling & Reminders
- Automated SMS/email notifications for sessions and tasks

### Client/Parent Experience

#### Task Dashboard
- Clear view of assigned activities with deadlines
- Completion tracking with media upload capabilities

#### Progress Center
- Visual representation of improvement metrics
- Achievement tracking and milestone celebration

#### Messaging Portal
- Direct therapist communication
- Notification system

## Technical Architecture
- Frontend: React with TypeScript
- Backend/Database: Firebase
- UI Framework: Tailwind CSS
- AI Processing: OpenAI GPT

## Database Schema

### Firebase Firestore Collections

#### `users`
```typescript
interface User {
  id: string;                   // Firebase Auth UID
  email: string;                // User email
  displayName: string;          // Full name
  role: 'therapist' | 'client'; // User role
  phoneNumber?: string;         // Optional phone number
  photoURL?: string;            // Profile image URL
  createdAt: Timestamp;         // Account creation date
  lastLogin: Timestamp;         // Last login timestamp
  subscriptionTier?: 'basic' | 'professional' | 'enterprise'; // Therapist only
  subscriptionStatus?: 'active' | 'canceled' | 'trial'; // Therapist only
  subscriptionExpiry?: Timestamp; // Therapist only
  settings: {                   // User preferences
    notifications: boolean;
    emailAlerts: boolean;
    smsAlerts: boolean;
    theme: 'light' | 'dark' | 'system';
  }
}
```

#### `therapists`
```typescript
interface Therapist {
  id: string;                   // Same as user.id for therapist role
  userId: string;               // Reference to users collection
  specialty: string[];          // E.g., ['pediatric', 'speech', 'sensory']
  businessName?: string;        // Practice name if applicable
  businessAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  licenseNumber?: string;       // Professional license
  activeClientCount: number;    // Count of active clients
  subscription: {
    tier: 'basic' | 'professional' | 'enterprise';
    status: 'active' | 'canceled' | 'trial';
    expiry: Timestamp;
    paymentMethod?: string;
  }
}
```

#### `clients`
```typescript
interface Client {
  id: string;                   // Unique client ID
  therapistId: string;          // Reference to therapist
  userId?: string;              // Reference to user (if client has login)
  firstName: string;
  lastName: string;
  dateOfBirth: Timestamp;
  gender?: string;
  contactInfo: {
    email?: string;
    phone?: string;
    guardianName?: string;      // For pediatric clients
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
  diagnosis: string[];          // List of diagnoses
  notes: string;                // Admin/general notes
  status: 'active' | 'inactive' | 'archived';
  createdAt: Timestamp;
  lastSessionDate?: Timestamp;
  goalAreas: string[];          // E.g., ['fine motor', 'speech articulation']
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    authorizationDetails: string;
  };
  profilePhotoURL?: string;
}
```

#### `sessions` (subcollection of `clients`)
```typescript
interface Session {
  id: string;                   // Session ID
  clientId: string;             // Reference to client
  therapistId: string;          // Reference to therapist
  date: Timestamp;              // Session date and time
  duration: number;             // Duration in minutes
  status: 'scheduled' | 'completed' | 'canceled' | 'no-show';
  location: 'clinic' | 'school' | 'home' | 'telehealth';
  soap: {
    subjective: string;         // Client-reported information
    objective: string;          // Therapist observations
    assessment: string;         // Clinical assessment
    plan: string;               // Treatment plan
  };
  attachments: {                // Media attachments
    id: string;
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    name: string;
    uploadedAt: Timestamp;
  }[];
  sentToClient: boolean;        // Whether session notes were shared
  privateNotes?: string;        // Notes not shared with client
  billingStatus?: 'unbilled' | 'billed' | 'paid';
  billingCode?: string;         // CPT code
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `tasks` (subcollection of `clients`)
```typescript
interface Task {
  id: string;                   // Task ID
  clientId: string;             // Reference to client
  therapistId: string;          // Reference to therapist
  title: string;                // Task title
  description: string;          // Detailed instructions
  createdAt: Timestamp;
  assignedDate: Timestamp;
  dueDate: Timestamp;
  status: 'assigned' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  completionDetails?: {
    completedDate: Timestamp;
    notes: string;              // Client notes on completion
    rating?: number;            // Difficulty rating (1-5)
  };
  attachments: {                // Instructions/resources
    id: string;
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    name: string;
    uploadedAt: Timestamp;
  }[];
  submissions: {                // Client submissions
    id: string;
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    name: string;
    uploadedAt: Timestamp;
    notes?: string;
  }[];
  reminderSent: boolean;
  frequency?: 'once' | 'daily' | 'weekly';
  goalArea: string[];           // Associated goals
  sessionId?: string;           // Associated session if applicable
}
```

#### `messages`
```typescript
interface Message {
  id: string;                   // Message ID
  conversation: string;         // Conversation ID (clientId-therapistId)
  senderId: string;             // User ID of sender
  recipientId: string;          // User ID of recipient
  senderRole: 'therapist' | 'client';
  text: string;                 // Message content
  sentAt: Timestamp;
  readAt?: Timestamp;
  attachments?: {
    id: string;
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    name: string;
  }[];
}
```

#### `goals` (subcollection of `clients`)
```typescript
interface Goal {
  id: string;                   // Goal ID
  clientId: string;             // Reference to client
  therapistId: string;          // Reference to therapist
  title: string;                // Goal title
  description: string;          // Detailed description
  category: string;             // Goal category/area
  status: 'active' | 'achieved' | 'discontinued';
  dateCreated: Timestamp;
  targetDate?: Timestamp;       // Target completion date
  dateAchieved?: Timestamp;     // Actual completion date
  progress: number;             // Progress percentage (0-100)
  baseline: string;             // Starting point
  progressNotes: {
    date: Timestamp;
    note: string;
    progressValue: number;
  }[];
  relatedTasks: string[];       // IDs of related tasks
}
```

#### `notifications`
```typescript
interface Notification {
  id: string;                   // Notification ID
  userId: string;               // Recipient user ID
  type: 'session' | 'task' | 'message' | 'system';
  title: string;                // Notification title
  message: string;              // Notification content
  createdAt: Timestamp;
  read: boolean;                // Read status
  entityId?: string;            // Related entity ID (session, task, etc.)
  entityType?: 'session' | 'task' | 'message';
  action?: string;              // Action URL path
}
```

#### `subscriptions` (for therapists)
```typescript
interface Subscription {
  id: string;                   // Subscription ID
  userId: string;               // Therapist user ID
  tier: 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'canceled' | 'trial';
  startDate: Timestamp;
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: string;
  paymentDetails?: {
    last4: string;              // Last 4 digits of card
    brand: string;              // Card brand
    expMonth: number;
    expYear: number;
  };
  billingHistory: {
    date: Timestamp;
    amount: number;
    status: 'succeeded' | 'failed' | 'pending';
    receiptUrl?: string;
  }[];
}
```

### Firebase Storage Structure
/profile-photos/{userId}
/client-photos/{clientId}
/session-attachments/{clientId}/{sessionId}/{attachmentId}
/task-attachments/{clientId}/{taskId}/{attachmentId}
/task-submissions/{clientId}/{taskId}/{submissionId}
/message-attachments/{conversationId}/{messageId}/{attachmentId}


## Project Structure
therapytrack/
├── public/ # Static files
│ ├── favicon.ico
│ ├── logo.svg
│ └── manifest.json
├── src/
│ ├── assets/ # Images, fonts, etc.
│ │ ├── images/
│ │ └── icons/
│ ├── components/ # Reusable components
│ │ ├── auth/ # Authentication components
│ │ │ ├── LoginForm.tsx
│ │ │ ├── RegisterForm.tsx
│ │ │ └── PasswordReset.tsx
│ │ ├── common/ # Shared UI components
│ │ │ ├── Button.tsx
│ │ │ ├── Card.tsx
│ │ │ ├── Modal.tsx
│ │ │ ├── Notification.tsx
│ │ │ └── ...
│ │ ├── layout/ # Layout components
│ │ │ ├── AppLayout.tsx
│ │ │ ├── Sidebar.tsx
│ │ │ ├── Header.tsx
│ │ │ └── Footer.tsx
│ │ ├── therapist/ # Therapist-specific components
│ │ │ ├── ClientList.tsx
│ │ │ ├── ClientCard.tsx
│ │ │ ├── ClientForm.tsx
│ │ │ ├── SessionForm.tsx
│ │ │ ├── TaskForm.tsx
│ │ │ ├── GoalTracker.tsx
│ │ │ └── ...
│ │ ├── client/ # Client-specific components
│ │ │ ├── TaskList.tsx
│ │ │ ├── TaskSubmission.tsx
│ │ │ ├── ProgressChart.tsx
│ │ │ └── ...
│ │ └── messaging/ # Messaging components
│ │ ├── ConversationList.tsx
│ │ ├── MessageThread.tsx
│ │ └── MessageComposer.tsx
│ ├── contexts/ # React context providers
│ │ ├── AuthContext.tsx
│ │ ├── NotificationContext.tsx
│ │ └── ThemeContext.tsx
│ ├── hooks/ # Custom React hooks
│ │ ├── useAuth.ts
│ │ ├── useFirestore.ts
│ │ ├── useStorage.ts
│ │ ├── useClients.ts
│ │ └── ...
│ ├── lib/ # Library code
│ │ ├── firebase/ # Firebase configuration
│ │ │ ├── config.ts
│ │ │ ├── auth.ts
│ │ │ ├── firestore.ts
│ │ │ └── storage.ts
│ │ ├── api/ # API clients and utilities
│ │ │ ├── openai.ts
│ │ │ └── twilioSms.ts
│ │ └── utils/ # Utility functions
│ │ ├── dateUtils.ts
│ │ ├── formatters.ts
│ │ └── validators.ts
│ ├── pages/ # Application pages
│ │ ├── auth/ # Authentication pages
│ │ │ ├── Login.tsx
│ │ │ ├── Register.tsx
│ │ │ └── ForgotPassword.tsx
│ │ ├── therapist/ # Therapist pages
│ │ │ ├── Dashboard.tsx
│ │ │ ├── Clients.tsx
│ │ │ ├── ClientDetail.tsx
│ │ │ ├── Sessions.tsx
│ │ │ ├── SessionDetail.tsx
│ │ │ ├── Tasks.tsx
│ │ │ └── ...
│ │ ├── client/ # Client pages
│ │ │ ├── Dashboard.tsx
│ │ │ ├── Tasks.tsx
│ │ │ ├── Progress.tsx
│ │ │ └── ...
│ │ ├── messaging/ # Messaging pages
│ │ │ ├── Inbox.tsx
│ │ │ └── Conversation.tsx
│ │ ├── settings/ # Settings pages
│ │ │ ├── Profile.tsx
│ │ │ ├── Subscription.tsx
│ │ │ └── ...
│ │ ├── LandingPage.tsx # Marketing landing page
│ │ ├── NotFound.tsx
│ │ └── ...
│ ├── services/ # Services for API calls
│ │ ├── authService.ts
│ │ ├── clientService.ts
│ │ ├── sessionService.ts
│ │ ├── taskService.ts
│ │ ├── messageService.ts
│ │ └── ...
│ ├── store/ # State management (optional)
│ │ ├── slices/
│ │ │ ├── authSlice.ts
│ │ │ ├── clientsSlice.ts
│ │ │ └── ...
│ │ └── store.ts
│ ├── types/ # TypeScript type definitions
│ │ ├── auth.types.ts
│ │ ├── client.types.ts
│ │ ├── session.types.ts
│ │ ├── task.types.ts
│ │ └── ...
│ ├── App.tsx # Root App component
│ ├── index.tsx # Entry point
│ ├── routes.tsx # Route definitions
│ └── tailwind.css # Tailwind CSS
├── firebase/ # Firebase backend
│ ├── functions/ # Cloud Functions
│ │ ├── src/
│ │ │ ├── auth/
│ │ │ ├── notifications/
│ │ │ ├── billing/
│ │ │ └── index.ts
│ │ ├── package.json
│ │ └── tsconfig.json
│ └── firestore.rules # Firestore security rules
├── .env # Environment variables
├── .env.local # Local environment variables
├── .firebaserc # Firebase project configuration
├── .gitignore
├── firebase.json # Firebase configuration
├── package.json
├── README.md
├── tailwind.config.js # Tailwind configuration
├── tsconfig.json # TypeScript configuration
└── vite.config.ts # Vite configuration

## User Stories

### Therapist Perspective
- Secure authentication for client data access
- Streamlined client onboarding and task assignment
- Efficient SOAP documentation
- Visual progress tracking
- Secure client communication
- Smart notification system

### Client/Parent Perspective
- Simple access to assigned activities
- Easy media submission for completed tasks
- Direct therapist communication
- Intuitive progress visualization

## Interface Overview

### Therapist Dashboard
- Navigation: Clients • Tasks • Sessions • Messages • Analytics • Settings
- Context-sensitive main panel

### Client Portal
- Navigation: Tasks • Progress • Messages
- Simplified, focused interface

## Vision
TherapyTrack aims to empower independent therapists with enterprise-grade tools at accessible pricing. The platform balances powerful features with ease of use, creating immediate value while establishing a foundation for future AI-enhanced capabilities.
