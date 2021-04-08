/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { LesmisSessionType } from '../../models';

declare global {
  namespace Express {
    export interface Request {
      session?: LesmisSessionType;
      ctx: Record<string, unknown>;
    }

    export interface Response {
      ctx: Record<string, unknown>;
    }
  }
}
