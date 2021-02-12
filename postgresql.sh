#/bin/bash

 psql -c "CREATE USER imagestore WITH SUPERUSER PASSWORD 'imagestore';"
 psql -c "CREATE DATABASE imagestore;"

