#!/bin/bash

#Need this for scriptery
apt install curl gpg -y

#Install the required programs
##First is Postgresql - This requires importing their repo key and repo
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
RELEASE=$(lsb_release -cs)
echo "deb http://apt.postgresql.org/pub/repos/apt/ ${RELEASE}"-pgdg main | sudo tee  /etc/apt/sources.list.d/pgdg.list
apt update
apt install -y postgresql-11


##Gotta do a little extra for Node too
curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash -
apt install nodejs -y

##Do the rest, no extras required
apt install npm build-essential -y

apt install nginx -y

#Make an Config folder
mkdir /etc/imagestore
cp -r ../frontend /etc/imagestore/
cp -r ../backend /etc/imagestore/

#Load up the system with the proper configurations

if (ss -ln | grep ":8080")
then
	loopcheck=1
	read -p "Port conflict detected. Select new port to host ImageStore:  " port
	while [ $loopcheck -eq 1 ]
	do
		if [[ "$port" =~ [a-zA-Z] ]]
		then
			echo "Invalid input detected"
			read -p "Port conflict detected. Select new port to host ImageStore:  " port
		else 
			sed -i "s/8080/$port/" default.conf
			loopcheck=0
		fi
	done
fi
cp default.conf /etc/nginx/sites-enabled/imagestore.conf
cp ImageStoreFRONT.service /etc/systemd/system/ImageStoreFRONT.service
cp ImageStoreBACK.service /etc/systemd/system/ImageStoreBACK.service

#Init an user and the database
ranpass=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)

su postgres -c "./postgresql.sh $ranpass"
echo "PGSTRING=postgres://imagestore:$ranpass@localhost:5432/imagestore" > /etc/imagestore/backend/.env

#Install node modules
cd /etc/imagestore/frontend
/usr/bin/npm i
/usr/bin/npm run-script build
cd /etc/imagestore/backend
/usr/bin/npm i
/usr/bin/npm install ts-node

#Service Time
systemctl enable postgresql
systemctl enable nginx
systemctl enable ImageStoreFRONT
systemctl enable ImageStoreBACK
systemctl start postgresql
systemctl start ImageStoreBACK
systemctl start ImageStoreFRONT
systemctl restart nginx


