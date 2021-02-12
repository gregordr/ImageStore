#!/bin/bash

#Need this for scriptery
apt install curl

#Install the required programs
##First is Postgresql - This requires importing their repo key and repo
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
RELEASE=$(lsb_release -cs)
echo "deb http://apt.postgresql.org/pub/repos/apt/ ${RELEASE}"-pgdg main | sudo tee  /etc/apt/sources.list.d/pgdg.list
apt install -y postgresql-11


##Gotta do a little extra for Node too
curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash -
sudo apt-get install -y nodejs

##Do the rest, no extras required
apt install -y npm nginx build-essential

#Service Time
systemctl enable postgresql
systemctl enable nginx
systemctl start postgresql

#Init an user and the database
su postgres -c './postgresql.sh'
echo "PGSTRING=postgres://imagestore:imagestore@localhost:5432/imagestore" > backend/.env



