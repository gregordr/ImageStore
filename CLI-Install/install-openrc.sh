
#!/bin/bash

#Check for the package manager used by the system
if [[ $(which apk) != "apk not found" ]]; then
pkgman="apk"
install="add"
update="update"
elif [[ $(which apt) != "apt not found" ]]; then
pkgman="apt"
install="install"
update="update"
elif [[ $(which yum) != "yum not found" ]]; then
pkgman="yum"
install="install"
update="update"
elif [[ $(which pacman) != "pacman not found" ]]; then
pkgman="pacman"
install="-S"
update="-Syy"
fi

#Install the required programs

$pkgman $update

##On Debian/Ubuntu based distros gotta do a little extra for Node
if [[ "$pkgman" == "apt" ]]; then
apt install curl -y
curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash -
apt install nodejs -y
fi

case $pkgman in

yum | apt)
$pkgman $install postgresql npm build-essential nginx -y
;;

pacman | apk)
$pkgman $install postgresql npm build-essential nginx
;;

esac

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

#Check if sites-enabled is present and enabled in nginx.conf
cd /etc/nginx
if [[ ! -d "sites-enabled" ]]; then
mkdir -p sites-enabled
fi

if ! grep -q '^include /etc/nginx/sites-enabled/' nginx.conf; then                                                                     
sed -ir '/^http {*/a  \\tinclude /etc/nginx/sites-enabled/*.conf' nginx.conf                                                                     
fi  

cp default.conf /etc/nginx/sites-enabled/imagestore.conf
cp ImageStoreFRONT /etc/init.d/ImageStoreFRONT
cp ImageStoreBACK /etc/init.d/ImageStoreBACK

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
