# Build stage
FROM node:20-alpine as build
WORKDIR /app

# Copy package.json & tsconfig
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Copy frontend env file
COPY .env.frontend .env

# Build Vite
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
