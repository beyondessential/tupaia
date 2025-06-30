import { Entity } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

export interface EntitiesResponseItem
  extends KeysToCamelCase<
    Pick<Entity, 'id' | 'name' | 'code' | 'type' | 'parent_id' | 'updated_at_sync_tick'>
  > {}

export type Params = Record<string, never>;
export type ResBody = EntitiesResponseItem[];
export type ReqBody = Record<string, any>;
export type ReqQuery = Record<string, never>;
