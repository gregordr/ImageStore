# ImageStore

ImageStore is a self-hosted photo gallery, that makes Google Photos users feel right at home.

## Features:
- Clean and intuitive UI for desktop and mobile browsers
- Automatic thumbnail creation for faster loading times
- Fast uploads for both photos and videos
- Albums to sort your photos
- Easily searchable labels
- Automatic image-tagging
- Face recognition
- AI based search
- Modular architecture for easy expanding

[Online demo](https://gregordr.github.io/ImageStore/)

This should give you a feeling of how everything works with images of cats. The demo is not very up to date or fast, but you can use it to see if you like the UI in general.

To upload your own images and use all features, you will need to self-host.

![preview](https://imgur.com/0yZQ7c7.jpg)

## Installation instructions:

### Docker prebuilt images

Requirements:

 - Docker
 - Docker-compose
 - For more advanced features: x86_64 CPU (also known as x64, x86_64, AMD64 and Intel 64)

Download the docker-compose.yml: ```wget https://raw.githubusercontent.com/gregordr/ImageStore/main/docker-compose.yml```.

Run ```docker-compose up```. If you want any optional modules, use ```--profile module``` to add them. Check below for a list of modules and explanations! 

Example: ```docker-compose --profile search --profile face --profile import up```.

Go to http://localhost:3000. You can edit the used port in the dockerfile.

You can update to the newest version with ```docker-compose pull```. Again, use ```--profile module``` if you also want to update a module. 

Last, if you want to run the dev-branch, do ```TAG=:test docker-compose up```.

### Docker build images yourself

Requirements:
 - Docker
 - Docker-compose
 - For automatic labeling: x86_64 CPU (also known as x64, x86_64, AMD64 and Intel 64)

If you want to build yourself, then clone this repo and run ```docker-compose -f docker-compose-build.yml up```. Again, you can use ```--profile``` to add features.

### Without docker
Requires Ubuntu 18.04/20.04.

```
git clone https://github.com/gregordr/ImageStore
cd CLI-Install
sudo ./imagestore-build.sh
```
This will install and configure everything as needed in order to host ImageStore. PostgreSQL 11, Nodejs and nginx will be installed.
By default it hosts over port 8080. If it is already in use, it will ask for an alternate port. The created database user is seeded with a random 16 character string, so there is no default password to worry about. 

The Imagestore service by default will start on boot. To stop Imagestore, run
```sudo systemctl stop ImageStoreFRONT.service; sudo systemctl stop ImageStoreBACK.service;```

To prevent the service from starting on boot, run 
```sudo systemctl disable ImageStoreFRONT.service; sudo systemctl disable ImageStoreBACK.service;```

### Notes for raspberry Pi:

Incase you get an error with the backend saying unreachable code, you might have to run the following commands:

```
wget http://ftp.ch.debian.org/debian/pool/main/libs/libseccomp/libseccomp2_2.5.1-1_armhf.deb
sha256sum libseccomp2_2.5.1-1_armhf.deb
# CONFIRM THAT THE OUTPUT MATCHES THE FOLLOWING LINE BEFORE YOU RUN THE LAST COMMAND:
# 7a4d09eea20f7e17a416825ae2be06ca08b9cb5072566045c545c74192e6fcca  libseccomp2_2.5.1-1_armhf.deb
sudo dpkg -i libseccomp2_2.5.1-1_armhf.deb
```
## List of modules:

These are the currently avaialable modules, or add-ons. 
- detectron: Will automatically add relevant tags on your images.
- yolo: Same as detectron, but with less accuracy and much less processing power needed. Don't activate both at the same time or they will conflict. 
- search: With this module you can look for pictures similar to another image, and also search for pictures by their description. This will replace the default search, which looks for the image name and relevant tags.
- face: This modules will find faces in your pictures, and enable you to look up other pictures of a person by pressing on their face on the sidebar/infopanel.
- import: This will create an import directory. It contains the folders "import" and "rejected". Anything placed in the first folder will be uploaded to ImageStore. On success it is deleted, on an error it is moved to the second folder.
## Contributing:

Feel free to open an issue if you want to see any new features.

If you would like to implement a feature, please create a PR to the ```test``` branch.
