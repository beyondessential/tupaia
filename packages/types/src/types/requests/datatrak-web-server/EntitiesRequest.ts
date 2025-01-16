import { Entity } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

export type Params = Record<string, never>;
export type ResBody = KeysToCamelCase<
  Pick<Entity, 'id' | 'name' | 'code' | 'type' | 'parent_id'>
>[];
export type ReqBody = Record<string, any>;
export type ReqQuery = Record<string, never>;
