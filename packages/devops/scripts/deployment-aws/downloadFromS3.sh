#!/bin/bash -le

FILE_URI="s3://$1"
DESTINATION=$2
aws s3 cp $FILE_URI $DESTINATION