# ImageStore

[Online demo](https://gregordr.github.io/ImageStore/)

This shows off all currently available features - the only restriction is that you cannot upload your own images.

![preview](https://imgur.com/0yZQ7c7.jpg)

### Instructions:

#### Docker prebuilt images

Requirements:

 - x86_64 CPU (also known as x64, x86_64, AMD64 and Intel 64)
 - Docker
 - Docker-compose

Download the docker-compose.yml: ```wget https://raw.githubusercontent.com/gregordr/ImageStore/main/docker-compose.yml```.

Edit it according to your liking, then run ```docker-compose up```. Note that you need to comment in one of the two labelers, in case you want automatic image labeling.

Go to http://localhost:3000, or whichever port you have chosen to use.

#### Docker build images yourself

Requirements:
 - Docker
 - Docker-compose

If you want to build yourself, for example because you are not on x86_64, then clone this repo and run ```docker-compose -f docker-compose-build.yml up```

#### Without docker

Requirements:
 - npm
 - node
 - NGINX
 - postgreSQL v11

This is a bit more complicated. Start by spinning up a postgreSQL v11 database, and put the URI to it into a ```.env``` file inside of the ```backend``` folder, like this: ```PGSTRING=postgres://user-pass@location:port/db```

After that, you can go into the frontend and backend folders, and run ```npm i``` in both, then ```npm start```. This should make them serve content.

Last, spin up a NGINX instance, with the configuration file found in ```./nginx```. Now, you should be ready to go.
