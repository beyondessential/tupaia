/* eslint-disable no-console */

// dependencies
const async = require('async');
const AWS = require('aws-sdk');
const util = require('util');
const pngToJpeg = require('png-to-jpeg');
const fileType = require('file-type');
const Jimp = require('jimp');

// constants
const THUMB_WIDTH = 500;

// get reference to S3 client
const s3 = new AWS.S3();

exports.handler = function (event, context, callback) {
  // Read options from the event.
  console.log('Reading options from event:\n', util.inspect(event, { depth: 5 }));
  const srcBucket = event.Records[0].s3.bucket.name;
  // Object key may have spaces or unicode non-ASCII characters.
  const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  const dstBucket = srcBucket;
  const dstKey = `thumbnails/${srcKey}`;

  // Infer the image type.
  const typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    callback('Could not determine the image type.');
    return;
  }
  const imageType = typeMatch[1];
  if (imageType != 'jpg' && imageType != 'png') {
    callback('Unsupported image type: ${imageType}');
    return;
  }

  // Download the image from S3, transform, and upload to a different S3 bucket.
  async.waterfall(
    [
      function download(next) {
        // Download the image from S3 into a buffer.
        s3.getObject(
          {
            Bucket: srcBucket,
            Key: srcKey,
          },
          next,
        );
      },
      function convertToJpg(response, next) {
        const theFileType = fileType(new Uint8Array(response.Body));
        if (theFileType.mime === 'image/png') {
          pngToJpeg({ quality: 80 })(response.Body).then(output => next(null, output));
        } else {
          next(null, response.Body);
        }
      },
      function resize(data, next) {
        Jimp.read(data, function (err, image) {
          image
            .resize(THUMB_WIDTH, Jimp.AUTO)
            .quality(60)
            .getBuffer(Jimp.MIME_JPEG, (e, buffer) => next(null, buffer));
        });
      },
      function upload(data, next) {
        // Stream the transformed image to a different S3 bucket.
        s3.putObject(
          {
            Bucket: dstBucket,
            Key: dstKey.replace('.png', '.jpg'),
            Body: data,
            ContentType: 'image/jpeg',
            ACL: 'public-read',
          },
          next,
        );
      },
    ],
    function (err) {
      if (err) {
        console.error(
          `Unable to resize ${srcBucket}/${srcKey} and upload to ${dstBucket}/${dstKey} due to an error: ${err}`,
        );
      } else {
        console.log(
          `Successfully resized ${srcBucket}/${srcKey} and uploaded to ${dstBucket}/${dstKey}`,
        );
      }

      callback(null, 'message');
    },
  );
};
