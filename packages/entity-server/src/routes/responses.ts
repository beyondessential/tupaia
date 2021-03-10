/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { Response } from 'express';
import { Context, EntityModel, EntityResponseObject } from '../types';

// eslint-disable-next-line @typescript-eslint/comma-dangle
export interface FetchEntityResponse<ResBody = EntityResponseObject> extends Response<ResBody> {
  context: Context<{ formatEntityForResponse: (model: EntityModel) => EntityResponseObject }>;
}
