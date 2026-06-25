FROM node:20-alpine

WORKDIR /app

# Copy package files first — Docker caches this layer
# so npm install only re-runs when dependencies actually change
COPY package*.json ./
RUN npm install

# Copy the rest of the source
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]