/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { AUTH_STATUSES } from './constants';

export const checkIsLoggedIn = authState => authState.status === AUTH_STATUSES.AUTHENTICATED;
