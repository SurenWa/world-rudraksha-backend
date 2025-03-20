# Build stage
FROM node:20.19 AS build
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --force

# Add build arguments
ARG JWT_SECRET
ARG JWT_EXPIRATION
ARG DATABASE_URL
ARG NODE_ENV
ARG REFRESH_TOKEN_SECRET
ARG JWT_EXPIRATION

# Set environment variables
ENV JWT_SECRET=$JWT_SECRET
ENV JWT_EXPIRATION=$JWT_EXPIRATION
ENV DATABASE_URL=$DATABASE_URL
ENV NODE_ENV=$NODE_ENV
ENV REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET
ENV REFRESH_TOKEN_EXPIRATION=$REFRESH_TOKEN_EXPIRATION


# Copy the rest of the application code
COPY . .

# Generate Prisma client and build the application
RUN npx prisma generate
#RUN npx prisma db push
RUN npm run build

# Production stage
FROM node:20.19-slim

# Install necessary dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends libssl-dev dumb-init && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy built files and dependencies from the build stage
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/package.json .
#COPY --chown=node:node --from=build /usr/src/app/package-lock.json .
COPY --chown=node:node --from=build /usr/src/app/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma

# Install production dependencies
RUN npm install --omit=dev --force

# Set environment variables
ENV NODE_ENV production

# Expose the application port
EXPOSE 5000

# Run the application
USER node
CMD ["dumb-init", "node", "dist/main"]