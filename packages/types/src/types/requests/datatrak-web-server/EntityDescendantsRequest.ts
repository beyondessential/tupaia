/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Country, Entity, Project } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

type EntityResponse = Entity & {
  isRecent?: boolean;
  parent_name?: Entity['name'];
};

export type Params = Record<string, never>;
export type ResBody = KeysToCamelCase<EntityResponse>[];

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
