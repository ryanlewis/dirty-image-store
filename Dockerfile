FROM node:latest

ENV DIR /usr/lib/dirty-image-store

WORKDIR $DIR

COPY . .
RUN npm install

CMD npm start
