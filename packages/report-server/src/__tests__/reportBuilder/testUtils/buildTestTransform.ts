import { RecursivePartial } from '@tupaia/types';
import { Context } from '../../../reportBuilder/context';
import { buildTransform } from '../../../reportBuilder/transform';

export const buildTestTransform = (transformSteps: unknown, context?: RecursivePartial<Context>) =>
  buildTransform(transformSteps, { ...context } as Context);
