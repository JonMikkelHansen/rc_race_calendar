FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy the rest
COPY . .

# Build Strapi admin
RUN npm run build

EXPOSE 1337

CMD ["npm", "run", "start"]
