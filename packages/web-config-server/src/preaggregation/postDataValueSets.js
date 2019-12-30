/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import winston from 'winston';

export const postDataValueSets = async (dhisApi, dataValues) => {
  try {
    const response = await dhisApi.postDataValueSets(dataValues);
    if (response.importCount.imported + response.importCount.updated !== dataValues.length) {
      winston.warn('Failed to push values', {
        count: dataValues.length - (response.importCount.imported + response.importCount.updated),
      });
    } else {
      winston.info('Succesfully posted data values', { count: dataValues.length });
    }
  } catch (error) {
    winston.error('Error while posting data values', { error });
  }
};
