import { EntityModel as CommonEntityModel } from '@tupaia/database';

export class EntityModel extends CommonEntityModel {
  meditrakConfig = {
    ignorableFields: ['bounds', 'entity_polygon_id'],
    minAppVersion: '1.7.102',
  };
}
