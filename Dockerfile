FROM node:8-alpine

WORKDIR /app

ADD package.json ./
RUN npm install --production
ADD ./server ./server

EXPOSE 3000
ENV PORT 3000
CMD npm start