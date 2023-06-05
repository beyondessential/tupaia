/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import winston from 'winston';

export const addSurveyFile = async (models, { id, filename, data }) => {
  try {
    // TODO: stub
    console.log('addSurveyFile', id, filename);
  } catch (error) {
    winston.error(error.message);
  }
};
