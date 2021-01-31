FROM node:current-buster
WORKDIR /code
EXPOSE 4000
COPY package*.json ./
RUN npm i
COPY . .
VOLUME /code/media
CMD "npm" "start"