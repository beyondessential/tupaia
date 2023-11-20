/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export interface Change {
  record_id: string;
  record_type: string;
  type: 'update' | 'delete';
  old_record?: Record<string, unknown>;
  new_record?: Record<string, unknown>;
}
