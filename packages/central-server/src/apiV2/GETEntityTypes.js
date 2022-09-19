/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';

export const GETEntityTypes = async (req, res, next) => {
  const { models } = req;
  try {
    const { types } = await models.entity;
    const entityTypes = Object.values(types)
      .filter(value => value !== 'world')
      .map(value => {
        return { entityType: value };
      });
    respond(res, entityTypes);
  } catch (error) {
    next(error);
  }
};
