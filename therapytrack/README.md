# Theriq

Theriq is a comprehensive web-based SaaS application designed for independent occupational and speech therapists. It streamlines client management, session tracking, home exercise assignment, and secure communication within a HIPAA-considerate environment.

## Features

- Complete client management
- Structured session documentation (SOAP format)
- Exercise and task assignment
- Progress visualization
- Secure client/therapist communication
- Goal tracking
- End-to-end encryption for sensitive data

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account
- OpenAI API key (for Premium AI features)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/theriq.git
cd theriq
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file in the root directory with your configuration:
```
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration (Required for Premium AI features)
REACT_APP_OPENAI_API_KEY=your_openai_api_key

# Encryption Secret (Required for data security)
REACT_APP_ENCRYPTION_SECRET=your_encryption_secret_key
```

4. Start the development server
```
npm start
```

## AI Features

Theriq offers advanced AI capabilities in the Premium tier:

### AI Session Analysis
- Automatically analyze session history for trends and insights
- Generate progress summaries based on historical data
- Identify patterns in client responses and improvement areas

### AI Treatment Plan Generation
- Create personalized treatment plans based on client progress
- Generate evidence-based activity recommendations
- Customize plans to client-specific goals and needs

### Progress Predictions
- Forecast expected progress timelines
- Identify potential challenges before they arise
- Adjust treatment intensity based on predictive analytics

### Natural Language Search
- Search across all client records using natural language
- Find relevant notes, goals, and sessions with semantic understanding
- Save time with smart filtering and relevance ranking

### Voice-to-Notes Transcription
- Record sessions and automatically transcribe to text
- Generate structured SOAP notes from transcriptions
- Save time on documentation and focus more on client care

## Technology Stack

- Frontend: React with TypeScript
- UI Framework: Tailwind CSS
- Backend/Database: Supabase (PostgreSQL, Authentication, Storage)
- State Management: React Context API
- AI Features: OpenAI API (GPT-4, Whisper)
- Security: AES-256 encryption (crypto-js)

## Project Structure

The project follows a modular structure with components, contexts, hooks, and services separated into their respective directories.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Security Features

### Data Encryption

Theriq uses AES-256 encryption to secure sensitive client data:

- Each user has a unique encryption key derived from their user ID and an application secret
- Sensitive data is encrypted before storage and decrypted only when needed
- Data remains encrypted in the database and during transmission
- The encryption key is never stored directly in the client or database

To set up encryption:

1. Generate a strong random key (32 bytes recommended)
2. Set the key as REACT_APP_ENCRYPTION_SECRET in your environment configuration
3. For production, store this key securely in your hosting environment (e.g., Netlify environment variables)

**Important:** Changing the encryption secret will make previously encrypted data unrecoverable. Implement a key rotation strategy if needed.
