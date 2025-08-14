import { Entity, Project } from '../../models';

export type Params = Record<string, never>;

interface CountryAccess {
  id: Entity['id'];
  name: Entity['name'];
  hasAccess: boolean;
  accessRequests: Project['code'][];
}
export type ResBody = CountryAccess[];

export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
