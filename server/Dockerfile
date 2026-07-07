FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run prisma:generate && npm run build
EXPOSE 5000
CMD ["sh", "-c", "npm run prisma:push && npm run seed && npm run start"]
