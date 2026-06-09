import { ProjectResponse } from '../web-server';
import { Country } from '../../models';

export type Params = Record<string, never>;
export interface ResBody {
  id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  employer?: string;
  position?: string;
  mobileNumber?: string | null;
  project?: ProjectResponse | null;
  projectId?: string;
  country?: Country | null;
  deleteAccountRequested?: boolean;
  hasAdminPanelAccess?: boolean;
  hideWelcomeScreen?: boolean;
  accessPolicy?: Record<string, string[]>;
}
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
