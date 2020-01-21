/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import winston from 'winston';

export const postDataValueSets = async (dhisApi, dataValues) => {
  try {
    const { counts } = await dhisApi.postDataValueSets(dataValues);
    if (counts.imported + counts.updated !== dataValues.length) {
      winston.warn('Failed to push values', {
        count: dataValues.length - (counts.imported + counts.updated),
      });
    } else {
      winston.info('Succesfully posted data values', { count: dataValues.length });
    }
  } catch (error) {
    winston.error('Error while posting data values', { error });
  }
};
