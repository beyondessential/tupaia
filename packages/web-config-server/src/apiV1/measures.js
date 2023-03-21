import { PermissionsChecker } from './permissions';
import { RouteHandler } from './RouteHandler';
import { findAccessibleMapOverlays } from './utils';

export default class extends RouteHandler {
  static PermissionsChecker = PermissionsChecker;

  /**
   * Sample Response:
       {
          organisationUnitType: 'Country',
          organisationUnitCode: 'LA',
          name: 'Laos',
          measures: [
            {
              name: 'GroupA',
              children: [
                {
                  mapOverlayCode: 'Laos_Schools_A',
                  name: 'Overlay A',
                  ...presentationConfig,
                }
              ],
            },
            {
              name: 'GroupB',
              children: [
                {
                  name: 'GroupC',
                  children: [
                    {
                      mapOverlayCode: 'Laos_Schools_D',
                      name: 'Overlay D',
                      ...presentationConfig,
                    },
                  ],
                },
              ],
            }
          ],
        }
  */
  buildResponse = async () => {
    const { entity, query } = this;
    const { code: entityCode, name: entityName, country_code: entityCountryCode } = entity;
    const countryCode = entityCountryCode || entityCode;
    const permissionGroups = await this.req.getPermissionGroups(entityCode);

    let accessibleMapOverlayGroups = [];
    // Projects do not have a country_code
    if (countryCode) {
      // Find all the accessible map overlays first so that we can put them in the correct map overlay groups
      accessibleMapOverlayGroups = await findAccessibleMapOverlays(
        this.req.models,
        query.projectCode,
        countryCode,
        permissionGroups,
      );
    }

    return {
      organisationUnitType: entity.getOrganisationLevel(),
      organisationUnitCode: entityCode,
      name: entityName,
      measures: accessibleMapOverlayGroups,
    };
  };
}
