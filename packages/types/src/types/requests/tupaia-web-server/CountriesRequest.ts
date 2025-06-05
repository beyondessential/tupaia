import { Entity } from '../../models';

export interface CountriesResponseItem extends Pick<Entity, 'code' | 'name'> {}

export type Params = never;
export type ResBody = CountriesResponseItem[];
export type ReqBody = never;
export type ReqQuery = never;
