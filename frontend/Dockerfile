# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app with env vars
ARG REACT_APP_USE_N8N
ARG REACT_APP_N8N_URL
ARG REACT_APP_API_URL

ENV REACT_APP_USE_N8N=${REACT_APP_USE_N8N:-false}
ENV REACT_APP_N8N_URL=${REACT_APP_N8N_URL:-https://n8n.superprojetx.com}
ENV REACT_APP_API_URL=${REACT_APP_API_URL:-http://31.97.155.126:3000}

RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]