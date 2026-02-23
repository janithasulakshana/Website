#!/bin/bash
cd /c/Users/Aruthsha\ Kasandun/Desktop/Website

# Check git status
echo "=== Git Status ==="
git status

# Stage the files
echo "=== Staging files ==="
git add frontend/.env frontend/src/config/constants.js frontend/src/pages/Tours.jsx frontend/src/pages/Admin.jsx RUN_LOCALHOST.md

# Commit
echo "=== Committing ==="
git commit -m "Fix localhost API configuration for Vite"

# Create branch
echo "=== Creating branch ==="
git checkout -b blackboxai/fix-localhost-config

# Push
echo "=== Pushing ==="
git push -u origin blackboxai/fix-localhost-config

# Create PR
echo "=== Creating PR ==="
gh pr create --base main --head blackboxai/fix-localhost-config --title "Fix localhost API configuration for Vite" --body "Fixed environment variable configuration to work with Vite by using VITE_ prefix. Updated API endpoints in Tours.jsx and Admin.jsx to use centralized API_CONFIG."
