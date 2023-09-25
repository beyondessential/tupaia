/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Entity } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

// Default entities types used for multiple entity fetch routes
export interface Params {}
export type ResBody = KeysToCamelCase<Entity>[];
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
