FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install production dependencies
RUN npm install --production

# Copy application code
COPY backend/ ./

# Create data directory for database
RUN mkdir -p /data

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Start application
CMD ["npm", "start"]
