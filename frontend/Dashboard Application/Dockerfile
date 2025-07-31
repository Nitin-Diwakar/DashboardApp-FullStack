# Base
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /app

# Build
FROM base AS build

COPY . .

RUN npm ci

RUN npm run build:docker

# Production
FROM base AS final

ENV NODE_ENV production

RUN npm i -g serve

RUN chown -R node:node /app

# Run the application as a non-root user.
USER node

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s","dist"]