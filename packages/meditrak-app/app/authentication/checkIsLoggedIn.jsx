import { AUTH_STATUSES } from './constants';

export const checkIsLoggedIn = authState => authState.status === AUTH_STATUSES.AUTHENTICATED;
