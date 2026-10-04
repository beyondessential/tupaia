import { EntityModel as CommonEntityModel } from '@tupaia/database';

export class EntityModel extends CommonEntityModel {
  meditrakConfig = {
    // project_id is new in the entity-hierarchy epic and meaningless to MediTrak
    // (which models entities as canonical, one row per code). Strip it on sync
    // down so the legacy app's record validation doesn't see an unknown field.
    ignorableFields: ['bounds', 'entity_polygon_id', 'project_id'],
    minAppVersion: '1.7.102',
  };
}
