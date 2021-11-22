FROM ubuntu:latest
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update
RUN apt install ffmpeg python3 ca-certificates curl make g++ -y
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs
RUN update-ca-certificates --fresh
WORKDIR /code
EXPOSE 4000
COPY package*.json ./
RUN npm i
COPY . .
VOLUME /code/media
ENV IMAGESTORE_HOST 0.0.0.0
CMD "npm" "start"
