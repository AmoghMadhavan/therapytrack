#!/bin/bash

echo "Testing Supabase API directly..."

# Load .env file
ENV_FILE=.env
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' $ENV_FILE | xargs)
  echo "Loaded environment variables from $ENV_FILE"
else
  echo "Warning: $ENV_FILE not found"
fi

# Display configuration (masked for security)
echo "Supabase URL: ${REACT_APP_SUPABASE_URL:0:20}..."
echo "API Key length: ${#REACT_APP_SUPABASE_ANON_KEY}"

# Generate random email
RANDOM_EMAIL="test$(date +%s)@gmail.com"
PASSWORD="Test123!@#"

echo "Attempting signup with email: $RANDOM_EMAIL"

# Attempt signup
curl -X POST "${REACT_APP_SUPABASE_URL}/auth/v1/signup" \
  -H "apikey: ${REACT_APP_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"$PASSWORD\"}"

echo -e "\nTesting complete." 