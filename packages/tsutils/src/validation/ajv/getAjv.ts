/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { constructRecordExistsWithId } from '@tupaia/utils';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { IdFormat } from './customFormats';

type DatabaseModels = { entity: any; question: any; optionSet: any };

export const getAjv = (models?: DatabaseModels) => {
  const ajv = new Ajv();
  addFormats(ajv);

  ajv.addFormat(IdFormat.name, IdFormat.config);

  if (models) {
    ajv.addKeyword({
      keyword: 'checkIdExists',
      async: true,
      validate: async (schema: { table: keyof DatabaseModels }, data: string) => {
        try {
          const validateFunc = constructRecordExistsWithId(models[schema.table]);
          await validateFunc(data);
        } catch (e) {
          return false;
        }
        return true;
      },
    });
  }

  return ajv;
};
