/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { UserAccount } from '../../models';
import { KeysToCamelCase } from '../../../utils';

export type Params = Record<string, never>;
export type ResBody = KeysToCamelCase<UserAccount>;
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
