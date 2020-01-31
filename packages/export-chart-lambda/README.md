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

**Lambda Layers**  
The lambda is also configured with the following layers:

| Merge order | Name              | Layer version | Version ARN                                                          |
| ----------- | ----------------- | ------------- | -------------------------------------------------------------------- |
| 1           | chrome-aws-lambda | 8             | arn:aws:lambda:ap-southeast-2:764866452798:layer:chrome-aws-lambda:8 |
| 2           | ghostscript       | 1             | arn:aws:lambda:ap-southeast-2:764866452798:layer:ghostscript:1       |

These layers provide the chrome and ghostscript binaries to run the core logic of the lambda code.

## Development

In order to update the lambda code, make your code changes here in this package. Once changes are complete, run `yarn package` from this package's root directory and upload the package.zip via the [aws lambda function web-console](https://ap-southeast-2.console.aws.amazon.com/lambda/home?region=ap-southeast-2#/functions/export-charts-v2).

You can also edit the code directly within the [aws lambda function web-console](https://ap-southeast-2.console.aws.amazon.com/lambda/home?region=ap-southeast-2#/functions/export-charts-v2), however you must ensure that the code base here is kept in sync with whatever the lambda code is.

In order to get tupaia to make use of the code changes you made, switch the lamba version the web-config-server uses to `'$LATEST'`

**Versioning**  
Before merging into dev, you must create a new lambda version for the code changes you've made. Do this by:

1. For our internal tracking, update the version in this package's package.json file (eg. '1.0.0' => '1.0.1')
2. Run `yarn package` and upload the latest package.zip to the [aws lambda function web-console](https://ap-southeast-2.console.aws.amazon.com/lambda/home?region=ap-southeast-2#/functions/export-charts-v2)
3. In the [aws lambda function web-console](https://ap-southeast-2.console.aws.amazon.com/lambda/home?region=ap-southeast-2#/functions/export-charts-v2), create a new version (Actions -> Publish new version) and give it a description containing the new package version (eg. 'v1.0.0: Export Chart Lambda')
4. In the web-config-server (and anywhere else that makes use of this lambda) update the lamba version (note: this is assigned by aws and does not match the version we use in package.json)
5. Push these changes up to your feature branch, and you're ready to merge  
   Note: A lamba version's code cannot be changed after its creation, so ensure that you have code approval before creating the version.
