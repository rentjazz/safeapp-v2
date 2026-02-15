FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Copy .env file if it exists
COPY .env* ./

EXPOSE 3000

CMD ["npm", "start"]