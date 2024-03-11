FROM node:latest
WORKDIR /app

COPY package.json tsconfig.json yarn.lock ./

COPY ./ ./

RUN yarn

RUN yarn build
CMD "yarn" "start"