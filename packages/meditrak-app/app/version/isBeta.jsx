/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import Config from 'react-native-config';

export const isBeta = !!Config.BETA_BRANCH;
export const betaBranch = Config.BETA_BRANCH;
export const centralApiUrl = 'http://10.0.2.2:8090/v2';
// Config.CENTRAL_API_URL;
