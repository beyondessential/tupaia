Stop tomcat
```
sudo service tomcat stop
```

Set up apt repo
```
sudo vi /etc/apt/sources.list.d/pgdg.list
deb http://apt.postgresql.org/pub/repos/apt/ xenial-pgdg main
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
```

Update postgis to 2.4, and make some required db change hacks
```
sudo apt install postgresql-9.5-postgis-2.4
sudo su postgres
psql dhis2
ALTER EXTENSION postgis UPDATE;
ALTER TABLE userinfo ADD COLUMN welcomemessage TEXT;
TRUNCATE TABLE oauth_access_token;
TRUNCATE TABLE oauth_refresh_token;
\q
exit
```

Install and upgrade to postgres 10
```
sudo apt install postgresql-10 postgresql-10-postgis-2.4 postgresql-10-postgis-scripts
sudo pg_dropcluster 10 main --stop
sudo systemctl stop postgresql
sudo pg_upgradecluster -m upgrade 9.5 main
sudo pg_dropcluster 9.5 main
sudo systemctl start postgresql
```

Install dhis2 2.31
```
sudo su
cd /home/tomcat/webapps
rm -rf *
exit
wget https://releases.dhis2.org/2.31/2.31.3/dhis.war
sudo cp dhis.war /home/tomcat/webapps/ROOT.war
rm dhis.war
sudo service tomcat start
```

Monitor output
```
sudo tail -f /home/tomcat/logs/catalina.out
```
