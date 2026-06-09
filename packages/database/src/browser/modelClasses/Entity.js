import { EntityModel as EntityModelBase } from '../../core/modelClasses';

export class EntityModel extends EntityModelBase {
  // We don't support geographic data in the browser
  customColumnSelectors = null;
}
