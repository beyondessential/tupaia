/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import { DataBrokerModelRegistry } from '../types';

export const getOrganisationUnitsByCountry = async (
  models: DataBrokerModelRegistry,
  organisationUnitCodes: string[],
) => {
  const orgUnits = await models.entity.find({ code: organisationUnitCodes });
  const organisationUnitCodesByCountryCodes = Object.fromEntries(
    Object.entries(groupBy(orgUnits, 'country_code')).map(([countryCode, orgUnitsInCountry]) => [
      countryCode,
      orgUnitsInCountry.map(({ code }) => code),
    ]),
  );
  return organisationUnitCodesByCountryCodes;
};
