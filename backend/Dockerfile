FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git docker-cli

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
