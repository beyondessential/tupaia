import multer from 'multer';
import { getTempDirectory } from '@tupaia/server-utils';

/**
 * Parses a multipartJson request where:
 *  - file parts have a fieldname
 *  - the rest of the data is a json part with fieldname `payload`
 *
 * And sets up req to be:
 *  - body:
 *    - parsed json `payload`
 *    merged with
 *    - files keyed by fieldname
 *
 * @param {boolean} [addFilesToBody] If true, will add each File to the body by the given form part name, e.g. myfile: File
 */
export const multipartJson =
  (addFilesToBody = true) =>
  async (req, res, next) => {
    if (req.headers['content-type'].startsWith('multipart/form-data')) {
      const parserMiddleware = multer({
        storage: multer.diskStorage({
          destination: getTempDirectory('uploads'),
          filename: (req, file, callback) => {
            callback(null, `${Date.now()}_${file.originalname}`);
          },
        }),
      }).any();

      parserMiddleware(req, res, () => {
        req.body = JSON.parse(req?.body?.payload || '{}');

        if (req.files && addFilesToBody) {
          for (const file of req.files) {
            req.body[file.fieldname] = file;
          }
        }

        next();
      });
    } else {
      next();
    }
  };
