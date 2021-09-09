/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { get } from '../api';

export const getCountries = async () => get('country');
