/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { api } from '../api';
import { DatabaseAccess } from './DatabaseAccess';

export const database = new DatabaseAccess(api);
