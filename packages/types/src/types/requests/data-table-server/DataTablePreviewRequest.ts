/**
 * @format id
 */
import { DataTable } from '../../models';

export interface DataTablePreviewRequest extends Omit<DataTable, 'id'> {
  /**
   * @additionalProperties true
   */
  runtimeParams?: Record<string, unknown>;
}
