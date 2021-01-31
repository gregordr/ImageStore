FROM ubuntu:latest
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update
RUN apt install nodejs npm -y
WORKDIR /code
EXPOSE 4000
COPY package*.json ./
RUN npm i --unsafe-perm
COPY . .
VOLUME /code/media
CMD "npm" "start"
