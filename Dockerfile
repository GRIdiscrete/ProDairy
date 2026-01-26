# Dockerfile
FROM node:20-alpine

# Install yarn
RUN apk add --no-cache yarn

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies with yarn
RUN yarn install --frozen-lockfile

# Copy all source code
COPY . .

# Build the application
RUN yarn build

EXPOSE 3000

# Start the application
CMD ["yarn", "start"]