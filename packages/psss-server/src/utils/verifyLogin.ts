import { AccessPolicy } from '@tupaia/access-policy';
import { PSSS_PERMISSION_GROUP } from '../constants';

export const hasPSSSAccess = (accessPolicy: AccessPolicy) =>
  accessPolicy.allowsAnywhere(PSSS_PERMISSION_GROUP);
