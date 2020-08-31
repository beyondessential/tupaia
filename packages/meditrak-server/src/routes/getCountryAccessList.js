/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import { respond } from '@tupaia/utils';

export async function getCountryAccessList(req, res, next) {
  const { userId, models } = req;

  try {
    const countries = await models.entity.find({ type: 'country' });
    const entityPermissions = await models.userEntityPermission.find({ user_id: userId });
    const permittedEntityIds = new Set(entityPermissions.map(p => p.entity_id));

    const countryAccessList = countries
      .filter(country => country.name !== 'No Country')
      .map(country => ({
        id: country.id,
        name: country.name,
        hasAccess: permittedEntityIds.has(country.id),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    respond(res, countryAccessList);
  } catch (error) {
    next(error);
  }
}
