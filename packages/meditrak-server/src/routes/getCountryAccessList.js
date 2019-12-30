/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import { respond } from '../respond';
import { getUserPermissionGroups } from '../dataAccessors';

export async function getCountryAccessList(req, res, next) {
  const { userId, models } = req;

  try {
    const countries = await models.country.all();
    const permissionGroups = await getUserPermissionGroups(models, userId, 'id');
    const permittedCountryIds = Object.keys(permissionGroups);

    const countryAccessList = countries
      .filter(country => country.name !== 'No Country')
      .map(country => ({
        id: country.id,
        name: country.name,
        hasAccess: permittedCountryIds.includes(country.id),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    respond(res, countryAccessList);
  } catch (error) {
    next(error);
  }
}
