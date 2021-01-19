/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import winston from 'winston';
import { uploadImage } from '../s3';

// Upload a surveyImage to s3
export const addSurveyImage = async (models, { id, data }) => {
  try {
    await uploadImage(data, id);
  } catch (error) {
    winston.error(error.message);
  }
};
