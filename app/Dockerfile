FROM node:14-alpine
WORKDIR /app

COPY package.json tsconfig.json yarn.lock ./
RUN yarn install --prod --frozen-lockfile

COPY ./ ./

RUN yarn add typescript --dev

RUN yarn build
CMD "yarn" "start"