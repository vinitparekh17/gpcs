# Stage 1: Build
FROM node:20-alpine as builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to install dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build the application
RUN yarn build

# Stage 2: Production
FROM node:20.13-bullseye-slim

ENV NODE_ENV=production

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

EXPOSE 8080

CMD ["node", "dist/src/index.js"]
