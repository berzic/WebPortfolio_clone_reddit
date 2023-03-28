FROM node:alpine

ENV PORT 3000

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm config set sharp_binary_host "https://npmmirror.com/mirrors/sharp"
RUN npm config set sharp_libvips_binary_host "https://npmmirror.com/mirrors/sharp-libvips"

RUN npm install

COPY ./ ./

ENV NODE_ENV production

RUN npm run build:production

CMD ["npm", "run", "start:production"]