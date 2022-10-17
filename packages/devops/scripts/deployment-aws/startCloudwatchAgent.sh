#!/bin/bash -le
DIR=$(dirname "$0")
echo "Turning on cloudwatch agent"
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:$DIR/cloudwatchConfig.json -s
