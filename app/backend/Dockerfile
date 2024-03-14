FROM node:latest
WORKDIR /app

COPY package.json tsconfig.json yarn.lock ./

COPY ./ ./

RUN npm install

RUN npm run build
CMD "npm" "run" "start"