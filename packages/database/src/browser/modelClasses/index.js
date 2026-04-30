import { EntityModel } from './Entity';

/**
 * @type {Record<string, import('../../core/DatabaseModel').DatabaseModel>}
 */
export const browserModelClasses = {
  Entity: EntityModel,
};
