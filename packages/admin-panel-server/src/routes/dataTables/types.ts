/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export type DataTable = {
  id: string;
  code: string;
  description: string;
  config: Record<string, unknown>;
  permissionGroups: string[];
  type: string;
};
