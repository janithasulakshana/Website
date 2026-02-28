FROM node:24

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies inside container
RUN npm install --omit=dev

# Copy application code
COPY backend/ ./

# Create data directory
RUN mkdir -p /data

EXPOSE 5000

ENV NODE_ENV=production
ENV HOST=0.0.0.0

CMD ["npm", "start"]