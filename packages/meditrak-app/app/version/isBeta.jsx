/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import Config from 'react-native-config';

export const isBeta = !!Config.BETA_BRANCH;
export const betaBranch = Config.BETA_BRANCH;
export const meditrakApiUrl =
  Config.MEDITRAK_API_URL || 'http://10.0.2.2:8020/v1';
