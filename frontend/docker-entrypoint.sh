#!/bin/sh

# Function to substitute environment variables in JavaScript files
substitute_env_vars() {
    echo "Substituting environment variables..."
    
    # Create a temporary file with environment variable substitutions
    cat > /tmp/env-config.js << EOF
window.ENV = {
  VITE_API_URL: '${VITE_API_URL:-http://localhost:5000/api}',
  VITE_APP_NAME: '${VITE_APP_NAME:-Blog Platform}',
  VITE_APP_DESCRIPTION: '${VITE_APP_DESCRIPTION:-A modern blog platform}',
  VITE_APP_VERSION: '${VITE_APP_VERSION:-1.0.0}',
  VITE_CLOUDINARY_CLOUD_NAME: '${VITE_CLOUDINARY_CLOUD_NAME:-}',
};
EOF

    # Copy the environment config to the nginx html directory
    cp /tmp/env-config.js /usr/share/nginx/html/env-config.js
    
    echo "Environment variables substituted successfully"
}

# Substitute environment variables
substitute_env_vars

# Execute the main command
exec "$@"