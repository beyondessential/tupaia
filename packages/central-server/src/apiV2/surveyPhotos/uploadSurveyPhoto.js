import { S3Client } from '@tupaia/server-utils';
import { isObjectId } from '@tupaia/tsutils';
import { ConflictError, respond, UnsupportedMediaTypeError, ValidationError } from '@tupaia/utils';

/**
 * Stores a photo taken for a survey answer, sent as the raw image in the request body.
 *
 * DataTrak sends these when syncing, ahead of the answers, much as MediTrak does with
 * `AddSurveyImage`. The answer holds just the photo’s ID, which the sync server turns into the
 * photo’s URL (see `AnswerModel` among `@tupaia/database`’s sync-server models). Sending the image
 * as a file, rather than as Base64 text inside the answer, means the device never has to read it
 * into memory to send it.
 *
 * Answers to Photo questions are URLs to these files, so the URL must be known from the ID alone:
 * only image types that are converted to WebP are accepted.
 *
 * Photos can’t be overwritten. A photo that is already there is taken to be this same photo, sent
 * again because the response to the first attempt was lost, so that isn’t an error.
 */
export async function uploadSurveyPhoto(req, res) {
  const { photoId } = req.params;
  const contentType = req.get('Content-Type')?.split(';')[0].trim().toLowerCase() ?? '';

  if (!isObjectId(photoId)) {
    throw new ValidationError(`Invalid photo ID: ${photoId}`);
  }
  if (!S3Client.isConvertedImageType(contentType)) {
    throw new UnsupportedMediaTypeError(`Survey photos can’t be ${contentType || 'untyped'}`);
  }
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    throw new ValidationError('No photo was sent');
  }

  try {
    await new S3Client().uploadImageBuffer(req.body, contentType, photoId);
  } catch (error) {
    if (!(error instanceof ConflictError)) throw error;
  }

  respond(res, { message: 'Photo saved' });
}
