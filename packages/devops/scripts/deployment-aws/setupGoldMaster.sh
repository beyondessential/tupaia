#!/usr/bin/env bash
# setupGoldMaster.sh is used by EC2 Image Builder to pre-bake a Tupaia AMI. To deploy changes:
#
#   1. Upload the latest version Amazon S3 → Buckets → tupaia_devops.
#   2. Optionally, go to EC2 Image Builder → Image pipelines → Tupaia Gold Master and run the
#      pipeline. Left alone, this will happen automatically according to the image pipeline’s build
#      schedule. Do this step if you need changes to take effect immediately.
#
# REMARK
#   The version of setup.sh invoked by this script is always from the default branch.

set -e

# clone our repo
cd /home/ubuntu
sudo -Hu ubuntu git clone https://github.com/beyondessential/tupaia.git

sudo -Hu ubuntu /home/ubuntu/tupaia/packages/devops/scripts/deployment-common/setup.sh
