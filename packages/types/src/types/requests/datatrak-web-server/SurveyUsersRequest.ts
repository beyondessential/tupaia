/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

export type Params = Record<string, string>;

type UserResponse = {
  id: string;
  name: string;
};

export type ResBody = UserResponse[];
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  filter?: Record<string, any>;
}
