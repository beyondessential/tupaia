import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertOptionEditPermissions } from './assertOptionPermissions';

export class EditOptions extends EditHandler {
  async assertUserHasAccess() {
    const optionChecker = accessPolicy =>
      assertOptionEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, optionChecker]));
  }

  async editRecord() {
    const option = await this.models.option.findById(this.recordId);
    const originalData = await option.getData();
    const updatedModel = { ...originalData, ...this.updatedFields };
    // empty string gets coalesced into undefined somewhere,
    // we want to be able to nullfiy the label field.
    if (updatedModel.label === '') updatedModel.label = null;

    return this.models.option.updateById(this.recordId, updatedModel);
  }
}
