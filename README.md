# ImageStore

[Online demo](https://gregordr.github.io/ImageStore/)

This should give you a feeling of how everything works with some images of cats. To upload your own images, you will of course need to self-host.

![preview](https://imgur.com/0yZQ7c7.jpg)

## Instructions:

### Docker prebuilt images

Requirements:

 - Docker
 - Docker-compose
 - For automatic labeling: x86_64 CPU (also known as x64, x86_64, AMD64 and Intel 64)

Download the docker-compose.yml: ```wget https://raw.githubusercontent.com/gregordr/ImageStore/main/docker-compose.yml```.

Edit it according to your liking, then run ```docker-compose up```. Note that you need to comment in one of the two labelers, in case you want automatic image labeling.

Go to http://localhost:3000, or whichever port you have chosen to use.

### Docker build images yourself

Requirements:
 - Docker
 - Docker-compose
 - For automatic labeling: x86_64 CPU (also known as x64, x86_64, AMD64 and Intel 64)

If you want to build yourself, then clone this repo and run ```docker-compose -f docker-compose-build.yml up```

### Without docker

Requirements:
 - npm
 - node
 - NGINX
 - postgreSQL v11

This is a bit more complicated. Start by spinning up a postgreSQL v11 database, and put the URI to it into a ```.env``` file inside of the ```backend``` folder, like this: ```PGSTRING=postgres://user-pass@location:port/db```

After that, you can go into the frontend and backend folders, and run ```npm i``` in both, then ```npm start```. This should make them serve content.

Last, spin up a NGINX instance, with the configuration file found in ```./nginx```. Now, you should be ready to go.

## Contributing:

Accepted feature requests can be seen under projects/ToDOs. If you have a new feature request, feel free to open an issue.

If you would like to implement a feature, please create a PR to the ```test``` branch.
