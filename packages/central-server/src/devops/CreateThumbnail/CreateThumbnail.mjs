import async from 'async';
import AWS from 'aws-sdk';
import fileType from 'file-type';
import sharp from 'sharp';
import util from 'util';

const THUMB_WIDTH = 500;

/** Same formats as @tupaia/server-utils S3Client.supportedImageTypes */
const SUPPORTED_IMAGE_MIMES = new Set([
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/tiff',
  'image/webp',
]);

const outputFormat = /** @type {const} */ ({ mediaType: 'image/webp', extension: 'webp' });

// get reference to S3 client
const s3 = new AWS.S3();

export function handler(event, _context, callback) {
  // Read options from the event.
  console.log('Reading options from event:\n', util.inspect(event, { depth: 5 }));
  const srcBucket = event.Records[0].s3.bucket.name;
  /**
   * - Object key may have spaces or unicode non-ASCII characters.
   * - Expected to have `uploads/` or `dev_uploads/` prefix due to Lambda trigger configuration.
   * @see https://ap-southeast-2.console.aws.amazon.com/lambda/home?region=ap-southeast-2#/functions/CreateThumbnail?subtab=triggers&tab=configure
   */
  const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replaceAll('+', ' '));

  const dstBucket = srcBucket;
  /**
   * Must not have prefix that will cause recursive trigger of this Lambda. (Don’t create thumbnail
   * of thumbnail.)
   * @see https://ap-southeast-2.console.aws.amazon.com/lambda/home?region=ap-southeast-2#/functions/CreateThumbnail?subtab=triggers&tab=configure
   */
  const dstKey = `thumbnails/${srcKey.replace(/\.[^.]+$/, '')}.${outputFormat.extension}`;

  // Download the image from S3, transform, and upload to a different S3 bucket.
  async.waterfall(
    [
      /** Download the image from S3 into a buffer. */
      function download(next) {
        s3.getObject({ Bucket: srcBucket, Key: srcKey }, next);
      },
      function validateAndPassBuffer(response, next) {
        const detected = fileType(new Uint8Array(response.Body));
        if (!detected) {
          next(new Error('Could not determine the image type.'));
          return;
        }
        if (!SUPPORTED_IMAGE_MIMES.has(detected.mime)) {
          next(new Error(`Unsupported image content: ${detected.mime}`));
          return;
        }
        next(null, response.Body);
      },
      function resizeAndConvert(buffer, next) {
        sharp(buffer)
          .autoOrient()
          .keepIccProfile()
          .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
          .webp({ quality: 90 })
          .toBuffer()
          .then(output => next(null, output))
          .catch(err => next(err));
      },
      function upload(data, next) {
        // Stream the transformed image back into bucket with different prefix
        s3.putObject(
          {
            ACL: 'public-read',
            Body: data,
            Bucket: dstBucket,
            ContentType: outputFormat.mediaType,
            Key: dstKey,
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
        console.log(`Resized ${srcBucket}/${srcKey} and uploaded to ${dstBucket}/${dstKey}`);
      }

      callback(null, 'message');
    },
  );
}
