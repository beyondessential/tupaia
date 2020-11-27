/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { FakeAPI } from './FakeApi';

export const getAffectedSites = FakeAPI.get('affected-sites');

export const getAlertsMessages = FakeAPI.get('messages');

export const getActivityFeed = FakeAPI.get('activity-feed');
