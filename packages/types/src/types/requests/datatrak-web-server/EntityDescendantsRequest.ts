/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Entity } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

type EntityResponse = Entity & {
  isRecent?: boolean;
};

export type Params = Record<string, never>;
export type ResBody = KeysToCamelCase<EntityResponse>[];

export type ReqBody = Record<string, unknown>;
export type ReqQuery = Record<string, never>;
