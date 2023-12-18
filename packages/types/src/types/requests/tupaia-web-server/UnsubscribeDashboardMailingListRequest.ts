/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
export type Params = {
  mailingListId: string;
};

export type Query = {
  email: string;
  token: string;
};

export type ResBody = {
  message: string;
};

export type ReqBody = Record<string, never>;
