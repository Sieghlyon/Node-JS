FROM alpine:latest

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
RUN npm install

COPY . /app

USER node
EXPOSE 8884
CMD [ "node", "." ]