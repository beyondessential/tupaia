/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

declare global {
  namespace Express {
    export interface Request {
      ctx: Record<string, unknown>;
    }

    export interface Response {
      ctx: Record<string, unknown>;
    }
  }
}
