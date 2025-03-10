import { KeysToCamelCase } from '../../../utils/casing';
import { LeaderboardItem } from '../../models-extra';

export type Params = Record<string, never>;

export type ResBody = KeysToCamelCase<LeaderboardItem>[];
export type ReqBody = Record<string, never>;
export type ReqQuery = {
  projectId?: string;
};
