FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm uninstall dev-dependencies
RUN apk update && \
    apk upgrade && \
    apk add --no-cache curl
CMD ["npm", "start"]
EXPOSE $PORT