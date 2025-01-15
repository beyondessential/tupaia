export type Params = Record<string, never>;
export type ResBody = Record<string, unknown>;
export type ReqBody = {
  oneTimeLoginToken?: string;
  oldPassword?: string;
  password?: string;
  newPassword: string;
  passwordConfirm?: string;
  newPasswordConfirm: string;
}
export type ReqQuery = Record<string, never>;
