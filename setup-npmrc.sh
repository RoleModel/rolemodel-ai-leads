#!/bin/bash
# This script sets up .npmrc with tokens from environment variables
# Used during Vercel builds

# Load .env.local if it exists (for local development)
if [ -f .env.local ]; then
  echo "Loading .env.local..."
  export $(cat .env.local | grep -v '^#' | xargs)
fi

echo "=== Setting up .npmrc ==="
echo "Current directory: $(pwd)"
echo "OPTICS_TOKEN set: $([ -n "$OPTICS_TOKEN" ] && echo "yes" || echo "no")"
echo "HUGEICONS_TOKEN set: $([ -n "$HUGEICONS_TOKEN" ] && echo "yes" || echo "no")"

# Create .npmrc file
cat > .npmrc << EOF
@hugeicons-pro:registry=https://npm.hugeicons.com/
@rolemodel:registry=https://npm.pkg.github.com/
EOF

# Add Hugeicons token if available
if [ -n "$HUGEICONS_TOKEN" ]; then
  echo "//npm.hugeicons.com/:_authToken=${HUGEICONS_TOKEN}" >> .npmrc
  echo "✓ Added HUGEICONS_TOKEN"
else
  echo "✗ Warning: HUGEICONS_TOKEN not found in environment"
fi

# Add Optics/GitHub token if available
if [ -n "$OPTICS_TOKEN" ]; then
  echo "//npm.pkg.github.com/:_authToken=${OPTICS_TOKEN}" >> .npmrc
  echo "✓ Added OPTICS_TOKEN to .npmrc"
  echo "Token preview: ${OPTICS_TOKEN:0:10}..."
else
  echo "✗ Warning: OPTICS_TOKEN not found in environment"
fi

echo "=== .npmrc contents ==="
cat .npmrc
echo "=== Setup complete ==="
