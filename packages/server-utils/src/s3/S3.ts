/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { fromEnv } from '@aws-sdk/credential-providers';
import { S3 as BaseS3 } from '@aws-sdk/client-s3';
import { requireEnv } from '@tupaia/utils';

export class S3 extends BaseS3 {
  public constructor() {
    super({ credentials: fromEnv(), region: requireEnv('AWS_REGION') });
  }
}
