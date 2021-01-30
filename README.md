# ImageStore

[Online demo](https://gregordr.github.io/ImageStore/)

This shows off all currently available features - the only restriction is that you cannot upload your own images.

### Requirements:

 - x86_64 CPU (also known as x64, x86_64, AMD64 and Intel 64)
 - Docker
 - Docker-compose

### Instructions:

Download the docker-compose.yml: ```wget https://raw.githubusercontent.com/gregordr/ImageStore/main/docker-compose.yml```.

Edit it according to your liking, then run ```docker-compose up```. Note that you need to comment in one of the two labelers, in case you want automatic image labeling.

Go to http://localhost:3000, or whichever port you have chosen to use.
