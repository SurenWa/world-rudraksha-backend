# Build stage
FROM node:20.19 AS build
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install --force

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