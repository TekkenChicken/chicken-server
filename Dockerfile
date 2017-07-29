FROM node:8-alpine

WORKDIR /app

ADD package.json ./
RUN npm install --production
ADD ./server ./server

EXPOSE 5000
ENV PORT 5000
CMD npm start