import { FakeAPI } from '../FakeApi';
import { post, put } from '../api';

export const getAffectedSites = () => FakeAPI.get('affected-sites');

export const getAlertsMessages = () => FakeAPI.get('messages');

export const getActivityFeed = () => FakeAPI.get('activity-feed');

export const createOutbreak = () => post();

export const archiveAlert = alertId => put(`alerts/${alertId}/archive`);
