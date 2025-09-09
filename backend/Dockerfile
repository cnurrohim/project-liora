FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./

RUN npm install --omit=dev

EXPOSE 3000
CMD ["node", "dist/index.js"]
