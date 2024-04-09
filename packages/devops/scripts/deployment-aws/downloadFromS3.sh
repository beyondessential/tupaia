#!/bin/bash -le

FILE_URI="s3://$1"
DESTIATION=$2
aws s3 cp $FILE_URI $DESTIATION