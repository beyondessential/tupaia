import AWS from 'aws-sdk';
import fileType from 'file-type';
import sharp from 'sharp';
import util from 'node:util';

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

const s3 = new AWS.S3();

export async function handler(event, _context) {
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

  try {
    /** Download the image from S3 into a buffer. */
    const response = await s3.getObject({ Bucket: srcBucket, Key: srcKey }).promise();

    const detected = fileType(new Uint8Array(response.Body));
    if (!detected) throw new Error('Could not determine the image type.');
    if (!SUPPORTED_IMAGE_MIMES.has(detected.mime)) {
      throw new Error(`Unsupported image content: ${detected.mime}`);
    }

    const outputBuffer = await sharp(response.Body)
      .autoOrient()
      .keepIccProfile()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer();

    // Stream the transformed image back into bucket with different prefix
    await s3
      .putObject({
        ACL: 'public-read',
        Body: outputBuffer,
        Bucket: dstBucket,
        ContentType: outputFormat.mediaType,
        Key: dstKey,
      })
      .promise();

    const message = `Resized ${srcBucket}/${srcKey} and uploaded to ${dstBucket}/${dstKey}`;
    console.log(message);
    return message;
  } catch (err) {
    console.error(`Failed to resize ${srcBucket}/${srcKey} and upload to ${dstBucket}/${dstKey}`);
    throw err;
  }
}
