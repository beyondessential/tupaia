import { Entity } from '../../models';

export interface ResBodyItem extends Pick<Entity, 'code' | 'name'> {}

export type Params = never;
export type ResBody = ResBodyItem[];
export type ReqBody = never;
export type ReqQuery = never;
