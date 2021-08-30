/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { getIsProductionEnvironment } from '../devops';

export const BUCKET_NAME = 'tupaia';
export const BUCKET_PATH = `https://s3-ap-southeast-2.amazonaws.com/${BUCKET_NAME}/`;
export const getImageFilePath = () =>
  getIsProductionEnvironment() ? 'uploads/images/' : 'dev_uploads/images/';
export const getUploadFilePath = () =>
  getIsProductionEnvironment() ? 'uploads/files/' : 'dev_uploads/files/';
