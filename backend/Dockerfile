FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
# Ideiglenes: SSL ellenőrzés kikapcsolása self-signed cert miatt
RUN npm config set strict-ssl false
RUN npm install || npm install --legacy-peer-deps
COPY tsconfig.json ./tsconfig.json
COPY src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/package.json .
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
CMD ["node", "dist/index.js"]
