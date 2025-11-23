#!/bin/bash
# This script sets up .npmrc with the OPTICS_TOKEN from environment variables
# Used during Vercel builds

if [ -n "$OPTICS_TOKEN" ]; then
  echo "Setting up .npmrc with OPTICS_TOKEN..."
  echo "//npm.pkg.github.com/:_authToken=${OPTICS_TOKEN}" >> .npmrc
else
  echo "Warning: OPTICS_TOKEN not found in environment"
fi
