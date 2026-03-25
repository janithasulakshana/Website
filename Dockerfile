# Build stage
FROM node:24-alpine AS build
WORKDIR /build
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod -R 777 /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
