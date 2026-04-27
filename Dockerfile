# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm i --force
# Copy all source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 3002

# Start the application
CMD ["npm","run", "start"]