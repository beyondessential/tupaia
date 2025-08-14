import { DataTableType } from '@tupaia/types';

export type DataTable = {
  id: string;
  code: string;
  description: string;
  config: Record<string, unknown>;
  permissionGroups: string[];
  type: DataTableType;
};
