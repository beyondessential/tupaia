/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 * This uploads a surveyImage to s3
 */
import { uploadImage } from '../s3';

export const addSurveyImage = async (models, { id, data }) => {
  const upload = await uploadImage(data, id);
  return upload;
};
