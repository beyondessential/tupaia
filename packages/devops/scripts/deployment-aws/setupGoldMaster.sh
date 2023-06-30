#!/bin/bash -le

# This script is used by Amazon Image Builder to pre-bake a Tupaia AMI
# To deploy changes, upload the latest to the S3 bucket "tupaia_devops"

# clone our repo
cd /home/ubuntu
sudo -Hu ubuntu git clone -b master https://github.com/beyondessential/tupaia.git

sudo -Hu ubuntu /home/ubuntu/tupaia/packages/devops/scripts/deployment-common/setup.sh