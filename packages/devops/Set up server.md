# ec2 instance

- Create an Ubuntu instance
- Add the following tags (example values only):
  - Stage: production
  - Name: Tupaia Production Server
  - Backup: Tupaia Production Server
  - RestoreCode: tupaia (if production)
  - RestoreFrom: tupaia (if dev, i.e. should be recloned from production nightly)
- Add ElasticIP
- Attach the role TupaiaServerRole to grant access to parameter store, lambda invocation, and cloudwatch monitoring

# node

### Install node

- `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash`
- Close and reopen terminal session
- `nvm install 12.18.3`

# ssl

### Install certbot-auto

```
wget https://dl.eff.org/certbot-auto
chmod a+x certbot-auto
sudo mv certbot-auto /usr/local/bin/certbot-auto
certbot-auto
```

### Set up dns route53 plugin

Create a programmatic AWS user through IAM with access to the following policy (change HOSTEDZONEID)

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "route53:ListHostedZones",
                "route53:GetChange"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "route53:ChangeResourceRecordSets"
            ],
            "Resource": [
                "arn:aws:route53:::hostedzone/HOSTEDZONEID"
            ]
        }
    ]
}
```

Add the credentials to `~/.aws/config`

```
[profile certbot]
aws_access_key_id=XXXXXX
aws_secret_access_key=XXXX/XXXXX
```

Install the dns plugin to certbot-auto's virtual environment

```
sudo su -
source /opt/eff.org/certbot/venv/bin/activate
pip install certbot-dns-route53
exit
```

Note that this installation will be cleared if certbot-auto is updated, (thus the --no-self-upgrade flag used on renewal)

### Request wildcard certificate

```
AWS_PROFILE=certbot certbot-auto certonly -d *.tupaia.org -d tupaia.org --dns-route53 -m edwin@beyondessential.com.au --agree-tos --non-interactive --server https://acme-v02.api.letsencrypt.org/directory
```

### Set up ssl certificate auto renew

- `mkdir /home/ubuntu/logs/`
- `crontab -e`
- Paste in `0 14 * * * /home/ubuntu/tupaia/packages/devops/scripts/utility/renewSslCertificate.sh | while IFS= read -r line; do printf '\%s \%s\n' "$(date)" "$line"; done > /home/ubuntu/logs/certbot-auto.txt` (14 UTC is midnight AEST)
  - For apache Wordpress sites use `0 14 * * * AWS_PROFILE=certbot /usr/local/bin/certbot-auto renew --no-self-upgrade --dns-route53 --non-interactive --server https://acme-v02.api.letsencrypt.org/directory --post-hook "sudo /opt/bitnami/ctlscript.sh restart apache" > /home/bitnami/logs/certbot-auto.txt` instead
- Save and exit

# nginx

### Install nginx

```
sudo apt-get update
sudo apt-get install nginx
```

### Replace /etc/nginx/nginx.conf with ./configs/nginx.conf and add servers.conf

```
sudo cp ./configs/nginx.conf /etc/nginx/
sudo cp ./configs/servers.conf /etc/nginx/conf.d/
```

### Put h5bp rules into nginx directory

```
git clone https://github.com/h5bp/server-configs-nginx.git
sudo cp -R ./server-configs-nginx/h5bp/ /etc/nginx/
rm -rf server-configs-nginx
```

### Ensure nginx has access to serve files

```
chmod 755 /home/ubuntu/
```

### Start nginx

```
sudo service nginx start
```

# postgres

### Install postgresql & postgis

```
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt xenial-pgdg main" >> /etc/apt/sources.list'
wget --quiet -O - http://apt.postgresql.org/pub/repos/apt/ACCC4CF8.asc | sudo apt-key add -
sudo apt install postgresql-10 postgresql-10-postgis-2.4 postgresql-10-postgis-scripts
```

### Use postgres user to edit postgres config files

```
sudo su postgres
cd /etc/postgresql/10/main/
```

### Set up ssl keys

```
openssl req -new -text -out server.req
openssl rsa -in privkey.pem -out server.key
rm privkey.pem
openssl req -x509 -in server.req -text -key server.key -out server.crt
chmod og-rwx server.key
```

### Turn on ssl and listen to all connections

- `vi postgresql.conf`
- Under Connection Settings: `listen_addresses = '*'`
- Under Security and Authentication: `ssl = on`

### Edit pg_hba.conf

- `vi pg_hba.conf`
- Copy paste the following into the right section:

```
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     trust
# IPv4 local connections:
host    all             all             127.0.0.1/32            password
# IPv6 local connections:
host    all             all             ::1/128                 password
# SSL IPv4 all connections:
hostssl all             all             0.0.0.0/0               password
```

### Go back into the normal user

`exit`

### Retart postgresql service

`sudo service postgresql restart`

### Set up database and user

```
sudo su postgres
psql
CREATE USER tupaia WITH PASSWORD '{actual password}';
CREATE DATABASE tupaia WITH OWNER tupaia;
\q
exit
```

### Get a pg_dump from the live server onto your local machine

- ssh in to live
- `pg_dump -h 127.0.0.1 -U tupaia -f dump.sql tupaia`
- Use sftp to retrieve onto local e.g. using the Transmit app

### Transmit the dump to the new server and restore db

`psql tupaia -U tupaia < dump.sql`

# git

### Install git

```
sudo apt-get install git
```

### Install yarn

```
npm i --global yarn
```

### Set up deploy key

```
ssh-keygen -t rsa -b 4096 -C "admin@tupaia.org"
```

- Add deploy key to the repo https://github.com/beyondessential/tupaia/settings/keys

### Set up the tupaia repository

```
cd ~
git clone git@github.com:beyondessential/tupaia.git
```

# pm2

### Install pm2

```
cd ~
npm i --global pm2
pm2 install pm2-logrotate
```

# aws

### Install aws cli and set region

```
sudo apt-get install python-pip python-dev build-essential
pip install --upgrade pip --user
pip install --upgrade virtualenv --user
pip install awscli --upgrade --user
echo "Leave all fields blank except region, which should be to ap-southeast-2"
aws configure
```

### Install jq for processing json returned by SSM parameter store

```
sudo apt install jq
```

# startup

### Set startup script to be run on server start, so that all repositories are deployed

```
mkdir ~/logs
crontab -e
@reboot /home/ubuntu/tupaia/packages/devops/scripts/deployment/startup.sh | while IFS= read -r line; do printf '\%s \%s\n' "$(date)" "$line"; done  > /home/ubuntu/logs/deployment_log.txt
```

# monitoring

### Add cloudwatch monitoring agent

Install requirements

```
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
rm amazon-cloudwatch-agent.deb
sudo apt-get install collectd
```

Set up config, saving the following as /opt/aws/amazon-cloudwatch-agent/bin/config.json

```
{
	"agent": {
		"metrics_collection_interval": 60,
		"run_as_user": "root"
	},
	"metrics": {
		"append_dimensions": {
			"AutoScalingGroupName": "${aws:AutoScalingGroupName}",
			"ImageId": "${aws:ImageId}",
			"InstanceId": "${aws:InstanceId}",
			"InstanceType": "${aws:InstanceType}"
		},
		"metrics_collected": {
			"collectd": {
				"metrics_aggregation_interval": 60
			},
			"cpu": {
				"measurement": [
					"cpu_usage_idle",
					"cpu_usage_iowait",
					"cpu_usage_user",
					"cpu_usage_system"
				],
				"metrics_collection_interval": 60,
				"totalcpu": true
			},
			"disk": {
				"measurement": [
					"used_percent",
					"inodes_free"
				],
				"metrics_collection_interval": 60,
				"resources": [
					"*"
				]
			},
			"diskio": {
				"measurement": [
					"io_time",
					"write_bytes",
					"read_bytes",
					"writes",
					"reads"
				],
				"metrics_collection_interval": 60,
				"resources": [
					"*"
				]
			},
			"mem": {
				"measurement": [
					"mem_used_percent"
				],
				"metrics_collection_interval": 60
			},
			"netstat": {
				"measurement": [
					"tcp_established",
					"tcp_time_wait"
				],
				"metrics_collection_interval": 60
			},
			"statsd": {
				"metrics_aggregation_interval": 60,
				"metrics_collection_interval": 10,
				"service_address": ":8125"
			},
			"swap": {
				"measurement": [
					"swap_used_percent"
				],
				"metrics_collection_interval": 60
			}
		}
	}
}
```

Start the cloudwatch agent

```
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json -s
```

# codeship

- Add the ssh keys from each of the codeship projects to ~/.ssh/authorized_keys
- Delete the line from ~/.bashrc that makes it only run if in interactive mode (otherwise codeship doesn't have access to yarn, pm2 etc.)

# ssh (optional)

### On local machine, set .ssh/config to ignore known_hosts for dev ip (it changes every day so gets annoying to remove and re-add it)

`vi .ssh/config`

```
Host 52.65.166.211
   StrictHostKeyChecking no
   UserKnownHostsFile=/dev/null
```
