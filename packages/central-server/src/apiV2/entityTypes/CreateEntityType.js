import { ValidationError } from '@tupaia/utils';
import { BESAdminCreateHandler } from '../CreateHandler';

export class CreateEntityType extends BESAdminCreateHandler {
  // Since this isn't a real database type, we override the default validation
  async validate() {
    if (!this.newRecordData.type) {
      throw new ValidationError("Must provide a 'type' when creating an entity_type");
    }
  }

  async createRecord() {
    await this.models.entity.addEntityType(this.newRecordData);
    return { message: `Successfully added entity_type: ${this.newRecordData.type}` };
  }
}
