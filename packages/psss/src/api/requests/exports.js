/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { post } from '../api';

export const createExport = options => post('export', options);
