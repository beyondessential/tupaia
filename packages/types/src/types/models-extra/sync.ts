import { ISO8601Timestamp } from '../../utils/datetime';
import { Project } from '../models';

export interface SyncSessionInfo {
  beganPersistAt?: Date | ISO8601Timestamp;
  deviceId: `datatrak-web-${string}`;
  projectIds?: Project['id'][];
  totalToPull?: number;
  totalPushed?: number;
}
