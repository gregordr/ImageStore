FROM node:lts
WORKDIR /code
EXPOSE 3000
COPY package*.json ./
RUN npm i
COPY . .
ARG REACT_APP_DOCKER=true
ENV REACT_APP_DOCKER=$REACT_APP_DOCKER
RUN npm run-script build
CMD "npx" "serve" "-s" "build" "-p" "3000"
