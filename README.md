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
Requires Ubuntu 18.04/20.04. A RHEL/Centos build is in the works.

```
git clone https://github.com/gregordr/ImageStore
cd CLI-Install
sudo ./imagestore-build.sh
```
This will install and configure everything as needed in order to host ImageStore. PostgreSQL 11, Nodejs and nginx will be installed.
By default it hosts over port 8080. However, the script has built in error checking such that if you're already hosting something over that port, 
it will detect it and ask for an alternate port. The created database user is seeded with a random 16 character string, so there 
is no default password to worry about. 

The Imagestore service by default will start on boot. To stop Imagestore, run
```sudo systemctl stop ImageStoreFRONT.service; sudo systemctl stop ImageStoreBACK.service;```

To prevent the service from starting on boot, run 
```sudo systemctl disable ImageStoreFRONT.service; sudo systemctl disable ImageStoreBACK.service;```

## Contributing:

Accepted feature requests can be seen under projects/ToDOs. If you have a new feature request, feel free to open an issue.

If you would like to implement a feature, please create a PR to the ```test``` branch.
