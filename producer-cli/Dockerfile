# --- Stage 1: Build the application ---
# This stage installs all dependencies (including devDependencies) and builds the TypeScript source.
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

# Install all dependencies needed for the build using Yarn
RUN yarn install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the application, creating the 'dist' folder
RUN npm run build

# --- Stage 2: Create the final, optimized production image ---
# Start from a fresh, slim Node.js image
FROM node:20-alpine

WORKDIR /usr/src/app

# Required for `npm run` and `yarn` to work.
COPY package.json yarn.lock ./

# Install ONLY production dependencies using the lockfile. This creates a smaller node_modules folder.
RUN yarn install --production --frozen-lockfile

# Copy the compiled application code from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy the necessary data file from the builder stage
COPY --from=builder /usr/src/app/src/sample-data.json ./src/sample-data.json

# No CMD is needed, as this image is designed to be a task runner.