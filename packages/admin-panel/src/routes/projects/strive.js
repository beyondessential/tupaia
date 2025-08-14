import { StrivePage } from '../../pages/StrivePage';
import { BES_ADMIN_PERMISSION_GROUP } from '../../utilities/userAccess';

export const strive = {
  label: 'Strive',
  path: '/strive',
  Component: StrivePage,
  requiresSomePermissionGroup: [BES_ADMIN_PERMISSION_GROUP],
};
