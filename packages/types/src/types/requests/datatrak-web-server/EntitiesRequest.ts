/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Entity } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

// Default entities types used for multiple entity fetch routes

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Params {}
export type ResBody = KeysToCamelCase<Entity>[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReqBody = Record<string, any>;
export type ReqQuery = Record<string, never>;
