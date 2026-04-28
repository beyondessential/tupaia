import { EntityModel as CommonEntityModel } from '@tupaia/database';

export class EntityModel extends CommonEntityModel {
  meditrakConfig = {
    ignorableFields: ['bounds'],
    minAppVersion: '1.7.102',
  };
}
