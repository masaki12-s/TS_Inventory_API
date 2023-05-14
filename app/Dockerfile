FROM node:14-alpine
WORKDIR /app

COPY package.json tsconfig.json yarn.lock ./
RUN yarn install --prod --frozen-lockfile

COPY ./ ./

ENV PORT=$PORT
ENV DB_HOST=$DB_HOST
ENV DB_PORT=$DB_PORT
ENV DB_USER=$DB_USER
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_DATABASE=$DB_DATABASE

RUN yarn build
CMD "yarn" "start"