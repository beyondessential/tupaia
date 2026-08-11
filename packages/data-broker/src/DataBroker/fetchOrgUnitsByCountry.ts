import { groupBy } from 'es-toolkit/compat';
import { DataBrokerModelRegistry } from '../types';

export const fetchOrgUnitsByCountry = async (
  models: DataBrokerModelRegistry,
  orgUnitCodes: string[],
) => {
  const orgUnits = await models.entity.find({ code: orgUnitCodes });
  const orgUnitsByCountryCodes = Object.fromEntries(
    Object.entries(groupBy(orgUnits, 'country_code')).map(([countryCode, orgUnitsInCountry]) => [
      countryCode,
      orgUnitsInCountry.map(({ code }) => code),
    ]),
  );
  return orgUnitsByCountryCodes;
};
