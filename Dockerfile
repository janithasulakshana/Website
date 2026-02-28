FROM node:24

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies inside container
RUN npm install --omit=dev

# Copy application code (excluding node_modules)
COPY backend/*.js ./
COPY backend/config ./config

# Create data directory
RUN mkdir -p /data

EXPOSE 5000

ENV NODE_ENV=production
ENV HOST=0.0.0.0

CMD ["npm", "start"]