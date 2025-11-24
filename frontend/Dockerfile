FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
# Ideiglenes: SSL ellenőrzés kikapcsolása self-signed cert miatt
RUN npm config set strict-ssl false
RUN npm install || npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
