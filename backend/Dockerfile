# === Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# === Stage 2: Production Image
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Only copy production files
COPY --from=build /app /app

# Install only prod deps
RUN npm ci --omit=dev

# Default port
ENV PORT=5000

EXPOSE 5000

CMD [ "node", "index.js" ]
