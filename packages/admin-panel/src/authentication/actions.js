import { LOGOUT } from './constants';

// workaround for resetting redux state on logout, until we move everything to react-query and hooks
export const logout = () => ({
  type: LOGOUT,
});
