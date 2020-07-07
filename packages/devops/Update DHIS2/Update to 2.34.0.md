Stop tomcat

```
sudo service tomcat stop
```

Install dhis2 2.34

```
sudo su
cd /home/tomcat/webapps
rm -rf *
exit
wget https://releases.dhis2.org/2.34/dhis2-stable-2.34.0.war
sudo cp dhis2-stable-2.34.0.war /home/tomcat/webapps/ROOT.war
rm dhis2-stable-2.34.0.war
sudo service tomcat start
```

Monitor output

```
sudo tail -f /home/tomcat/logs/catalina.out
```
