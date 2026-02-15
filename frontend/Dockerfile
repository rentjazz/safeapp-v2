# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
RUN npm run build

# Replace API URL in config.js
RUN if [ ! -z "$REACT_APP_API_URL" ]; then \
    sed -i "s|%REACT_APP_API_URL%|$REACT_APP_API_URL|g" build/config.js; \
  else \
    sed -i "s|%REACT_APP_API_URL%|http://31.97.155.126:3000|g" build/config.js; \
  fi

# Production stage with nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]