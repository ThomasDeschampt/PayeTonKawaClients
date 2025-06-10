FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache \
    openssl \
    libc6-compat \
    openssl-dev \
    python3 \
    make \
    g++

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3003

CMD ["npm", "run", "dev"] 