/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { RecursivePartial } from '@tupaia/tsutils';
import { Context } from '../../../reportBuilder/context';
import { buildTransform } from '../../../reportBuilder/transform';

export const buildTestTransform = (transformSteps: unknown, context?: RecursivePartial<Context>) =>
  buildTransform(transformSteps, { ...context } as Context);
