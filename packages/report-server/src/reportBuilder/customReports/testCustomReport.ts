/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { ReqContext } from '../context';

export const testCustomReport = async (reqContext: ReqContext) => {
  const { organisationUnitCodes: entityCodes, hierarchy } = reqContext.query;
  const facilities = await reqContext.services.entity.getDescendantsOfEntities(
    hierarchy,
    entityCodes,
    { filter: { type: 'facility' } },
  );
  return [{ value: facilities.length }];
};
