/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { IdFormat } from './customFormats';

export const getAjv = () => {
  const ajv = new Ajv();
  addFormats(ajv);

  ajv.addFormat(IdFormat.name, IdFormat.config);

  return ajv;
};
