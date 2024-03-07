/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { LesmisSessionRecord } from '../../models';

declare global {
  namespace Express {
    export interface Request {
      session?: LesmisSessionRecord;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx: any;
    }

    export interface Response {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx: any;
      translate: (...args: any[]) => any;
    }
  }
}
