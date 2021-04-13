/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { get } from '../api';

export const getCountries = async () => get('country');
