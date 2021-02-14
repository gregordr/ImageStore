#/bin/bash

 psql -c "CREATE USER imagestore WITH SUPERUSER PASSWORD '$1';"
 psql -c "CREATE DATABASE imagestore;"

