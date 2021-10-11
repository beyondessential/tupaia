/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import pick from 'lodash.pick';

export const entityApiMock = (entities: Record<string, Record<string, string>[]>) => ({
  getEntities: async (
    hierarchyName: string,
    entityCodes: string[],
    queryOptions: { fields?: string[] } = {},
  ) => {
    const foundEntities = entities[hierarchyName]?.filter(e => entityCodes.includes(e.code));
    const { fields } = queryOptions;
    return fields ? foundEntities.map(e => pick(e, fields)) : foundEntities;
  },
});
