/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import AWS from 'aws-sdk';

export const getS3Client = () => new AWS.S3();
