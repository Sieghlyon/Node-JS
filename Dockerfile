FROM node:alpine-6.9

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
RUN npm install

COPY . /app

USER node
EXPOSE 8884
CMD [ "node", "app.js" ]