/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import sanitize from 'sanitize-filename';

/**
 * Convert a string into a sanitized and truncated filename
 *
 * @param string
 * @returns string
 */
export const toFilename = string => {
  const maxLength = 255;
  const sanitized = sanitize(string).replace(/\s+/g, '-').toLowerCase();
  return sanitized.length <= maxLength ? sanitized : sanitized.slice(0, maxLength);
};
