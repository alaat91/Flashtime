FROM node:fermium-alpine3.17

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "npm", "run", "serve" ]