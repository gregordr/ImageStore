FROM node
WORKDIR /code
EXPOSE 3000
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run-script build
CMD "npx" "serve" "-s" "build" "-p" "3000"