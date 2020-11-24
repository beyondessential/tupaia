/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry as ModelRegistryClass } from '@tupaia/database';
import { Request } from 'express';
import { PsssSessionModel } from './models/PsssSession';

interface Session {
  id: string;
  email: string;
}

export interface ModelRegistry extends ModelRegistryClass {
  psssSession: PsssSessionModel;
}

export interface PsssRequest extends Request {
  session?: Session;
  models: ModelRegistry;
}

export interface PsssResponseBody {
  accessPolicy?: {};
  error?: string;
}
