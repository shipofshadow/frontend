#!/bin/bash

# Path to project root (adjust if needed)
PROJECT_DIR="/mnt/f/ischolar"
cd "$PROJECT_DIR" || exit

# Upload to VPS using rsync, excluding .htaccess
echo "Uploading files to VPS..."
rsync -avz --exclude='.htaccess' ./dist/ bitress@172.245.223.114:/var/www/ischolar/frontend/

echo "Deployment complete!"
