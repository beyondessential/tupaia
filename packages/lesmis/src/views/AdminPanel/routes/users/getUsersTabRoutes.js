import { usersTabRoutes } from '@tupaia/admin-panel';
import { getUsersPageConfig } from './getUsersPageConfig';
import { getPermissionsPageConfig } from './getPermissionsPageConfig';

export const getUsersTabRoutes = translate => ({
  ...usersTabRoutes,
  label: `${translate('admin.users')} & ${translate('admin.permissions')}`,
  childViews: [getUsersPageConfig(translate), getPermissionsPageConfig(translate)],
});
