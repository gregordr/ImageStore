#!/bin/bash

#Need this for scriptery
apt install curl gpg

#Install the required programs
##First is Postgresql - This requires importing their repo key and repo
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
RELEASE=$(lsb_release -cs)
echo "deb http://apt.postgresql.org/pub/repos/apt/ ${RELEASE}"-pgdg main | sudo tee  /etc/apt/sources.list.d/pgdg.list
apt update
apt install -y postgresql-11


##Gotta do a little extra for Node too
curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash -
apt install nodejs

##Do the rest, no extras required
apt install npm build-essential

apt install nginx

#Make an Config folder
mkdir /etc/imagestore
cp -r ../frontend /etc/imagestore/
cp -r ../backend /etc/imagestore/

#Load up the system with the proper configurations
cp default.conf /etc/nginx/conf.d/default.conf
cp ImageStoreFRONT.service /etc/systemd/system/ImageStoreFRONT.service
cp ImageStoreBACK.service /etc/systemd/system/ImageStoreBACK.service

#Init an user and the database
su postgres -c './postgresql.sh'
echo "PGSTRING=postgres://imagestore:imagestore@localhost:5432/imagestore" > /etc/imagestore/backend/.env

#Install node modules
cd /etc/imagestore/frontend
/usr/bin/npm i
cd /etc/imagestore/frontend
/usr/bin/npm i

#Service Time
systemctl enable postgresql
systemctl enable nginx
systemctl enable ImageStoreFRONT
systemctl enable ImagestoreBACK
systemctl start postgresql

systemctl start ImageStoreFRONT
systemctl start ImageStoreBACK
systemctl start nginx


