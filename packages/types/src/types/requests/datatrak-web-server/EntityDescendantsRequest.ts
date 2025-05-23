import { Country, Entity, Project } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

export interface EntityResponse
  extends KeysToCamelCase<
    Entity & {
      isRecent?: boolean;
      parent_name?: Entity['name'];
    }
  > {}

export type Params = Record<string, never>;
export type ResBody = EntityResponse[];

export type ReqBody = Record<string, unknown> & {
  filter: Record<string, unknown>;
  fields?: string[];
};
export type ReqQuery = {
  fields?: string[];
  filter: Record<string, string> & {
    countryCode: Country['code'];
    projectCode: Project['code'];
    grandparentId?: Entity['id'];
    parentId?: Entity['id'];
    type?: string;
  };
  searchString?: string;
  pageSize?: number;
};
