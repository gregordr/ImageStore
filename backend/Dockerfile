FROM ubuntu:latest
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update
RUN apt install nodejs npm -y
RUN apt install ca-certificates -y
RUN update-ca-certificates --fresh
RUN npm install -g npm@latest
WORKDIR /code
EXPOSE 4000
COPY package*.json ./
RUN npm i
COPY . .
VOLUME /code/media
CMD "npm" "start"
