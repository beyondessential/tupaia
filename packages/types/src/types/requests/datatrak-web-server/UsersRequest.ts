import { PermissionGroup } from '../../models';

export type Params = Record<string, string>;

export interface UserResponse {
  id: string;
  name: string;
}

export type ResBody = UserResponse[];
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  searchTerm?: string;
  permissionGroupId?: PermissionGroup['id'];
}
