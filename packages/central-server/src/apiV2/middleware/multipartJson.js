/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import multer from 'multer';
import { getTempDirectory } from '../../utilities';
import bodyParser from 'body-parser';

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
 */
export const multipartJson = async (req, res, next) => {
  const parserMiddleware = multer({
    storage: multer.diskStorage({
      destination: getTempDirectory('uploads'),
      filename: (req, file, callback) => {
        callback(null, `${Date.now()}_${file.originalname}`);
      },
    }),
  }).any();

  parserMiddleware(req, res, () => {
    req.body = JSON.parse(req.body.payload || '{}');

    for (const file of req.files) {
      req.body[file.fieldname] = file;
    }

    next();
  });
};
