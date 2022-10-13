FROM node:16
WORKDIR /code
EXPOSE 3000
COPY package*.json ./
RUN npm i  --legacy-peer-deps
COPY . .
ARG REACT_APP_DOCKER=true
ENV REACT_APP_DOCKER=$REACT_APP_DOCKER
RUN npm run-script build
CMD "npx" "serve" "-s" "build" "-p" "3000"
