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

interface DashboardWithMetadata extends Dashboard {
  items: DashboardItem[];
  mailingLists: MailingList[];
}
export type ResBody = KeysToCamelCase<DashboardWithMetadata>[];
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
