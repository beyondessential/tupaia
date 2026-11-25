Based off http://docs.aws.amazon.com/lambda/latest/dg/with-s3-example-deployment-pkg.html

To deploy:

1. `cd` to `packages/central-server/src/devops/CreateThumbnail/`
2. `yarn run package`
3. Use the ‘Update from a .zip file’ option to upload the code to the [CreateThumbnail](https://console.aws.amazon.com/lambda/home?region=ap-southeast-2#/functions/CreateThumbnail) Lambda Event Function

You can also do step 2 manually:

```sh
yarn workspaces focus --production # or `npm install --include=optional --omit=dev --os=linux --cpu=arm64`
zip --quiet --recurse-paths CreateThumbnail.zip CreateThumbnail.mjs node_modules
```
