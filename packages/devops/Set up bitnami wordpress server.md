# ec2 instance

- Create an Ubuntu instance based on an AMI created from one of our existing static site instances

# ssl

Certbot auto should already be installed as it was created from the existing static site. It will be
set up with existing certificates, which we should delete

### Delete existing certificates
```
sudo su
cd /etc/letsencrypt
rm -rf live/*
rm -rf archive/*
rm -rf renewal/*
exit
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

Edit the credentials in `~/.aws/config` (or create if it doesn't exist)
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
AWS_PROFILE=certbot certbot-auto certonly -d *.website.com -d website.com --dns-route53 -m edwin@beyondessential.com.au --agree-tos --non-interactive --server https://acme-v02.api.letsencrypt.org/directory
```

### Symlink apache config to the ssl certificates
```
sudo su
ln -sf /etc/letsencrypt/live/beyondessential.com.au/cert.pem /opt/bitnami/apache2/conf/server.crt
ln -sf /etc/letsencrypt/live/beyondessential.com.au/privkey.pem /opt/bitnami/apache2/conf/server.key
exit
sudo /opt/bitnami/ctlscript.sh restart apache
```

### Set up ssl certificate auto renew
This should already be set up if the instance was based on an existing one
- `crontab -e`
  - For apache Wordpress sites use `0 14 * * * AWS_PROFILE=certbot /usr/local/bin/certbot-auto renew --no-self-upgrade --dns-route53 --non-interactive --server https://acme-v02.api.letsencrypt.org/directory --post-hook "sudo /opt/bitnami/ctlscript.sh restart apache" >> /home/bitnami/logs/certbot-auto.txt` instead
- Save and exit
