import { S3 as BaseS3 } from '@aws-sdk/client-s3';
import { requireEnv } from '@tupaia/utils';

export class S3 extends BaseS3 {
  public constructor() {
    /**
     * Credentials come from the SDK’s default provider chain: `AWS_ACCESS_KEY_ID` and
     * `AWS_SECRET_ACCESS_KEY` when set (local dev), otherwise the EC2 instance role.
     */
    super({ region: requireEnv('AWS_REGION') });
  }
}
