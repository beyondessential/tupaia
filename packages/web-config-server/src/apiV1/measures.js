import { PermissionsChecker } from './permissions';
import { RouteHandler } from './RouteHandler';
import { findAccessibleMapOverlays, findAccessibleGroupedMapOverlays } from './utils';

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
                  measureId: 'Laos_Schools_A',
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
                      measureId: 'Laos_Schools_D',
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
    const { code: entityCode, name: entityName, country_code: enityCountryCode } = entity;
    const overlayCode = enityCountryCode || entityCode;
    const permissionGroups = await this.req.getPermissionGroups(entityCode);

    let accessibleMapOverlayGroups = [];
    // Projects do not have a country_code
    if (overlayCode) {
      // Find all the accessible map overlays first so that we can put them in the correct map overlay groups
      const accessibleMapOverlays = await findAccessibleMapOverlays(
        this.req.models,
        overlayCode,
        query.projectCode,
        permissionGroups,
      );

      // Find the accessible map overlay groups using the accessible map overlays above
      accessibleMapOverlayGroups = await findAccessibleGroupedMapOverlays(
        this.req.models,
        accessibleMapOverlays,
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
