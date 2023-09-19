/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { getDeviceAppVersion } from './getAppVersions';

export const hasVersionUpdated = fromVersion => fromVersion !== getDeviceAppVersion();
