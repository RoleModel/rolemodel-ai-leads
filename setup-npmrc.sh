#!/bin/bash
# This script sets up .npmrc with tokens from environment variables
# Used during Vercel builds

echo "Setting up .npmrc..."

# Create .npmrc file
cat > .npmrc << EOF
@hugeicons-pro:registry=https://npm.hugeicons.com/
@rolemodel:registry=https://npm.pkg.github.com/
EOF

# Add Hugeicons token if available
if [ -n "$HUGEICONS_TOKEN" ]; then
  echo "//npm.hugeicons.com/:_authToken=${HUGEICONS_TOKEN}" >> .npmrc
else
  echo "Warning: HUGEICONS_TOKEN not found in environment"
fi

# Add Optics/GitHub token if available
if [ -n "$OPTICS_TOKEN" ]; then
  echo "//npm.pkg.github.com/:_authToken=${OPTICS_TOKEN}" >> .npmrc
else
  echo "Warning: OPTICS_TOKEN not found in environment"
fi

echo ".npmrc setup complete"
