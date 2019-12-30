Based off of http://docs.aws.amazon.com/lambda/latest/dg/with-s3-example-deployment-pkg.html

To deploy use:
aws lambda create-function --region ap-southeast-2 --function-name CreateThumbnail --zip-file fileb:///Users/marty/Documents/Work/01_clients/tupaia/tupaia-resize-images.zip --role arn:aws:iam::843218180240:role/image-resize --handler CreateThumbnail.handler --runtime nodejs6.10 --profile adminuser --timeout 10 --memory-size 1024
