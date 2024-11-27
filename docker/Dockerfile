# Stage 1: Build
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to install dependencies
COPY package.json yarn.lock ./

RUN yarn cache clean

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build the application
RUN yarn build

# Stage 2: Production
FROM node:20.13-bullseye-slim

ENV NODE_ENV=development

# Use a non-root user for security
USER node

# Set the working directory
WORKDIR /usr/src/app

# Copy only the necessary files from the builder stage
COPY --chown=node:node package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --production --frozen-lockfile

# Copy the built application from the builder stage
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist

# Switch to root to perform installations
USER root

# Install CA certificates, curl, download the certificate, and clean up
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates && \
    curl https://certs.secureserver.net/repository/sf-class2-root.crt -o ./dist/cert && \
    apt-get remove -y curl && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Switch back to non-root user
USER node

EXPOSE 8080

CMD ["node", "dist/src/index.js"]
