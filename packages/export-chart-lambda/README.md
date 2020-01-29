# Export Chart Lambda

Lambda function for exporting charts from Tupaia.

## Configure the Lambda

The lambda is in [our aws lambda configurations](https://ap-southeast-2.console.aws.amazon.com/lambda/home?region=ap-southeast-2#/functions/export-charts-v2) with the name `export-charts-v2`.

It runs happily with the following settings:  
1. Execution role - chart-exporter
2. Runtime - Node.js12.x
3. Handler - index.handler
4. Memory - 1024 MB
5. Timeout - 5 mins

In order to update the lambda code, run `yarn package` from this package's root directory and upload the package.zip via the [aws lambda function web-console](https://ap-southeast-2.console.aws.amazon.com/lambda/home?region=ap-southeast-2#/functions/export-charts-v2)


**Lambda Layers**  
The lambda is also configured with the following layers:  
| Merge order | Name              | Layer version | Version ARN                                                          |
| ----------- | ----------------- | ------------- | -------------------------------------------------------------------- |
| 1           | chrome-aws-lambda | 8             | arn:aws:lambda:ap-southeast-2:764866452798:layer:chrome-aws-lambda:8 |
| 2           | ghostscript       | 1             | arn:aws:lambda:ap-southeast-2:764866452798:layer:ghostscript:1       |

These layers provide the chrome and ghostscript binaries to run the core logic of the lambda code.