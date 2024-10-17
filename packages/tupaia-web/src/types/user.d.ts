/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { KeysToCamelCase, TupaiaWebUserRequest } from '@tupaia/types';

export type User = KeysToCamelCase<TupaiaWebUserRequest.ResBody>;
