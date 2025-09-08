FROM node:20-alpine

# Install dependencies
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install --production

# Copy source & build
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
