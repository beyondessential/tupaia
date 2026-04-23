import AWS from 'aws-sdk';
import sharp from 'sharp';
import util from 'node:util';

const THUMB_WIDTH = 500;

const outputFormat = /** @type {const} */ ({ mediaType: 'image/webp', extension: 'webp' });

const s3 = new AWS.S3();

const formatter = new Intl.DurationFormat('en-AU');
function logWithTiming(message, performanceEntryName) {
  const [entry] = performance.getEntriesByName(performanceEntryName);
  const duration = formatter.format({ milliseconds: Math.round(entry.duration) }) || '0';
  console.log(`${message} in ${duration}`);
}

export async function handler(event, _context) {
  performance.mark('handler-start');
  console.log('Reading options from event:\n', util.inspect(event, { depth: 5 }));

  const srcBucket = event.Records[0].s3.bucket.name;
  /**
   * - Object key may have spaces or unicode non-ASCII characters.
   * - Expected to have `uploads/` or `dev_uploads/` prefix due to Lambda trigger configuration.
   * @see https://ap-southeast-2.console.aws.amazon.com/lambda/home?region=ap-southeast-2#/functions/CreateThumbnail?subtab=triggers&tab=configure
   */
  const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replaceAll('+', ' '));

  if (srcKey.endsWith('.svg')) {
    const message = `⏭️ Skipped SVG ${srcBucket}/${srcKey}`;
    console.log(message);
    return message;
  }

  const dstBucket = srcBucket;
  /**
   * Must not have prefix that will cause recursive trigger of this Lambda. (Don’t create thumbnail
   * of thumbnail.)
   * @see https://ap-southeast-2.console.aws.amazon.com/lambda/home?region=ap-southeast-2#/functions/CreateThumbnail?subtab=triggers&tab=configure
   */
  const dstKey = `thumbnails/${srcKey.replace(/\.[^.]+$/, '')}.${outputFormat.extension}`;

  try {
    performance.mark('fetch-start');
    const response = await s3.getObject({ Bucket: srcBucket, Key: srcKey }).promise();
    performance.measure('fetch', 'fetch-start');
    logWithTiming(`📥 Fetched ${srcBucket}/${srcKey}`, 'fetch');

    performance.mark('decode-start');
    const decoded = sharp(response.Body);
    const { format, width, height, size } = await decoded.metadata();
    performance.measure('decode', 'decode-start');
    logWithTiming(
      `🧩 Decoded as ${width.toLocaleString()} × ${height.toLocaleString()} ${format} (${size?.toLocaleString()} B)`,
      'decode',
    );

    performance.mark('compression-start');
    const outputBuffer = await decoded
      .autoOrient()
      .keepIccProfile()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer();
    performance.measure('compression', 'compression-start');
    logWithTiming(
      `🗜️ Compressed to ${THUMB_WIDTH}w WebP (${outputBuffer.length.toLocaleString()} B)`,
      'compression',
    );

    performance.mark('upload-start');
    await s3
      .putObject({
        ACL: 'public-read',
        Body: outputBuffer,
        Bucket: dstBucket,
        ContentType: outputFormat.mediaType,
        Key: dstKey,
      })
      .promise();
    performance.measure('upload', 'upload-start');
    logWithTiming(`📤 Uploaded to ${dstBucket}/${dstKey}`, 'upload');

    return `Resized ${srcBucket}/${srcKey} and uploaded to ${dstBucket}/${dstKey}`;
  } catch (err) {
    console.error(`Failed to resize ${srcBucket}/${srcKey} and upload to ${dstBucket}/${dstKey}`);
    throw err;
  } finally {
    performance.measure('total', 'handler-start');
    logWithTiming('🏁 Done', 'total');

    // In case of warm start, reset performance timeline
    // @see https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html
    performance.clearMarks();
    performance.clearMeasures();
    performance.clearResourceTimings();
  }
}
