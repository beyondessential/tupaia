/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

/**
 * @format id
 */
import { DataTable } from '../../models';

export interface DataTablePreviewRequest extends DataTable {
  /**
   * @additionalProperties true
   */
  runtimeParams?: Record<string, unknown>;
}
