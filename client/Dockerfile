FROM node:alpine

ENV PORT 3000

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./ ./

ENV NODE_ENV production

RUN npm run build:production

CMD ["npm", "run", "start:production"]