/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { BETA_BRANCH } from 'react-native-dotenv';

export const isBeta = !!BETA_BRANCH || false;
export const betaBranch = BETA_BRANCH || 'beta';
