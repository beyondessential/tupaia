import { ValidationError } from '@tupaia/utils';
import { BESAdminEditHandler } from '../EditHandler';

const EDITABLE_FIELDS = new Set(['name', 'code', 'data_source']);

export class EditEntityPolygon extends BESAdminEditHandler {
  async editRecord() {
    if ('polygon' in this.updatedFields) {
      // Polygon shape is only replaceable via re-import. Editing metadata is
      // free-form; editing geometry must go through the import path so the
      // round-trip semantics stay consistent.
      throw new ValidationError(
        'Cannot edit polygon geometry directly. Re-upload via Import to replace the polygon.',
      );
    }

    const update = {};
    for (const [key, value] of Object.entries(this.updatedFields)) {
      if (EDITABLE_FIELDS.has(key)) update[key] = value;
    }

    if (Object.keys(update).length === 0) {
      throw new ValidationError(
        `No editable fields provided. Allowed: ${[...EDITABLE_FIELDS].join(', ')}`,
      );
    }

    this.updatedFields = update;
    await this.updateRecord();
  }
}
