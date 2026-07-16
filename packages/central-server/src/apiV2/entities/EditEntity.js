import { ValidationError } from '@tupaia/utils';
import {
  assertAdminPanelAccessToCountry,
  assertAnyPermissions,
  assertBESAdminAccess,
} from '../../permissions';
import { TupaiaAdminEditHandler } from '../EditHandler';

const ALLOWED_FIELDS = new Set(['name', 'attributes', 'entity_polygon_id']);

export class EditEntity extends TupaiaAdminEditHandler {
  async assertUserHasAccess() {
    const permissionChecker = accessPolicy =>
      assertAdminPanelAccessToCountry(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, permissionChecker]));
  }

  async updateRecord() {
    const updatedFieldKeys = Object.keys(this.updatedFields);
    const disallowed = updatedFieldKeys.filter(key => !ALLOWED_FIELDS.has(key));
    if (disallowed.length > 0) {
      throw new ValidationError(
        `Cannot update entity field(s): ${disallowed.join(', ')}. Allowed: ${[...ALLOWED_FIELDS].join(', ')}.`,
      );
    }
    // Normalise an empty entity_polygon_id to null so the FK is cleared rather
    // than tripping the foreign-key constraint with an empty string.
    if ('entity_polygon_id' in this.updatedFields && !this.updatedFields.entity_polygon_id) {
      this.updatedFields.entity_polygon_id = null;
    }
    await this.models.entity.updateById(this.recordId, this.updatedFields);
    // Keep the cached bounds (used for map zoom) in sync with the linked
    // polygon, otherwise the map keeps zooming to the old location.
    if ('entity_polygon_id' in this.updatedFields) {
      await this.models.entity.updateBoundsFromPolygon(this.recordId);
    }
  }
}
