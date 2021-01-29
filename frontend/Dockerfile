FROM node
WORKDIR /code
EXPOSE 3000
COPY package*.json ./
RUN npm i
COPY . .
ARG REACT_APP_BACKEND
ENV REACT_APP_BACKEND=$REACT_APP_BACKEND
RUN npm run-script build
CMD "npx" "serve" "-s" "build" "-p" "3000"
