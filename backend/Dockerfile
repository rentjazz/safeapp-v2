FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Copy .env file if it exists (for local development)
# In production, env vars should be passed via docker-compose
COPY .env .env 2>/dev/null || echo "No .env file found, using environment variables"

EXPOSE 3000

CMD ["npm", "start"]