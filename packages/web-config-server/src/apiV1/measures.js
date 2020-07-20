import { PermissionsChecker } from './permissions';
import { RouteHandler } from './RouteHandler';
import { findAccessibleMapOverlays, findAccessibleGroupedMapOverlays } from './utils';

export default class extends RouteHandler {
  static PermissionsChecker = PermissionsChecker;

  /*** 
   * Sample Response:
    {
      GroupA: [
        {
          measureId: 'Laos_Schools_A',
          name: 'Overlay A',
          ...presentationOptions,
          type: 'mapOverlay',
        }
      ],
      GroupB: [
        {
          name: 'GroupC',
          children: [
            {
              measureId: 'Laos_Schools_D',
              name: 'Overlay D',
              ...presentationOptions,
              type: 'mapOverlay',
            }, 
          ],
          type: 'mapOverlayGroup'
        }, 
      ],
    }
  ***/
  buildResponse = async () => {
    const { entity, query } = this;
    const { code: entityCode, name: entityName, country_code: enityCountryCode } = entity;
    const overlayCode = enityCountryCode || entityCode;
    const userGroups = await this.req.getUserGroups(entityCode);

    let mapOverlaysByGroupName = {};
    const measures = {};
    // Projects do not have a country_code
    if (overlayCode) {
      //Find all the accessible map overlays first so that we can put them in the correct map overlay groups
      const accessibleMapOverlays = await findAccessibleMapOverlays(
        this.req.models.mapOverlay,
        overlayCode,
        query.projectCode,
        userGroups,
      );

      //Find the accessible map overlay groups using the accessible map overlays above
      mapOverlaysByGroupName = await findAccessibleGroupedMapOverlays(
        this.req.models.mapOverlayGroup,
        this.req.models.mapOverlayGroupRelation,
        accessibleMapOverlays,
      );

      console.log('mapOverlaysByGroupName', mapOverlaysByGroupName);

      // Sort groups alphabetically
      const sortedGroupNames = Object.keys(mapOverlaysByGroupName).sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase()),
      );
      sortedGroupNames.forEach(a => {
        measures[a] = mapOverlaysByGroupName[a];
      });
    }

    return {
      organisationUnitType: entity.getOrganisationLevel(),
      organisationUnitCode: entityCode,
      name: entityName,
      measures,
    };
  };
}
