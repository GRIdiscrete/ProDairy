# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm i --force

# Copy all source code
COPY . .

# Build the application
RUN npm run build

# Expose port 3003
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]