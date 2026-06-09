import { Dashboard, DashboardItem } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

export interface Params {
  projectCode: string;
  entityCode: string;
}

interface MailingList {
  entityCode: string;
  isSubscribed: boolean;
  isAdmin: boolean;
}

interface DashboardWithMetadata extends Omit<Dashboard, 'updated_at_sync_tick'> {
  items: Omit<DashboardItem, 'updated_at_sync_tick'>[];
  mailingLists: Omit<MailingList, 'updated_at_sync_tick'>[];
}
export type ResBody = KeysToCamelCase<DashboardWithMetadata>[];
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
