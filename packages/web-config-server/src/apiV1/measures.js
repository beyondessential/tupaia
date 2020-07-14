import { MapOverlay, MapOverlayGroup, MapOverlayGroupRelation } from '/models';
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { RouteHandler } from './RouteHandler';
import { PermissionsChecker } from './permissions';
import { reduceToDictionary } from '@tupaia/utils';
import keyBy from 'lodash.keyby';
import groupBy from 'lodash.groupby';

const { AND, RAW } = QUERY_CONJUNCTIONS;

export default class extends RouteHandler {
  static PermissionsChecker = PermissionsChecker;

  /**
   * Sample Response:
    {
      GroupA: [
        {
          measureId: 'Laos_Schools_A',
          name: 'Overlay A',
          ...presentationOptions,
          type: 'mapOverlay',
        },
        {
          measureId: 'Laos_Schools_B',
          name: 'Overlay B',
          ...presentationOptions,
          type: 'mapOverlay',
        },
        {
          measureId: 'Laos_Schools_C',
          name: 'Overlay C',
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
            {
              measureId: 'Laos_Schools_E',
              name: 'Overlay E',
              ...presentationOptions,
              type: 'mapOverlay',
            }, 
            {
              measureId: 'Laos_Schools_F',
              name: 'Overlay F',
              ...presentationOptions,
              type: 'mapOverlay',
            }
          ],
          type: 'mapOverlayGroup'
        }, 
        {
          name: 'GroupD',
          children: [
            {
              measureId: 'Laos_Schools_G',
              name: 'Overlay G',
              ...presentationOptions,
              type: 'mapOverlay',
            }, 
            {
              measureId: 'Laos_Schools_H',
              name: 'Overlay H',
              ...presentationOptions,
              type: 'mapOverlay',
            }, 
            {
              measureId: 'Laos_Schools_I',
              name: 'Overlay I',
              ...presentationOptions,
              type: 'mapOverlay',
            }
          ],
          type: 'mapOverlayGroup'
        }
      ],
    }
     */
  buildResponse = async () => {
    const { entity, query } = this;
    const { code: entityCode, name: entityName, country_code: enityCountryCode } = entity;
    const overlayCode = enityCountryCode || entityCode;
    const userGroups = await this.req.getUserGroups(entityCode);

    let mapOverlaysGroupedByGroupName = {};
    const measures = {};
    // Projects do not have a country_code
    if (overlayCode) {
      //Find all the accessible map overlays first so that we can put them in the correct map overlay groups
      const accessibleMapOverlays = await this.findAccessibleMapOverlays(
        overlayCode,
        query.projectCode,
        userGroups,
      );

      //Find the accessible map overlay groups using the accessible map overlays above
      mapOverlaysGroupedByGroupName = await this.findAccessibleGroupedMapOverlays(
        accessibleMapOverlays,
      );

      // Sort groups alphabetically
      const sortedGroupNames = Object.keys(mapOverlaysGroupedByGroupName).sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase()),
      );
      sortedGroupNames.forEach(a => {
        measures[a] = mapOverlaysGroupedByGroupName[a];
      });
    }

    return {
      organisationUnitType: entity.getOrganisationLevel(),
      organisationUnitCode: entityCode,
      name: entityName,
      measures,
    };
  };

  /**
   * Find accessible Map Overlays that have matched entityCode, projectCode and userGroups
   * @param {*} overlayCode
   * @param {*} projectCode
   * @param {*} userGroups
   */
  findAccessibleMapOverlays = async (overlayCode, projectCode, userGroups) => {
    const mapOverlays = await MapOverlay.find({
      [RAW]: {
        sql: `("userGroup" = '' OR "userGroup" IN (${userGroups.map(() => '?').join(',')}))`, // turn `['Public', 'Donor', 'Admin']` into `?,?,?` for binding
        parameters: userGroups,
      },
      [AND]: {
        [RAW]: {
          sql: '"countryCodes" IS NULL OR :overlayCode = ANY("countryCodes")',
          parameters: {
            overlayCode,
          },
        },
        [AND]: {
          projectCodes: {
            comparator: '@>',
            comparisonValue: [projectCode],
          },
        },
      },
    });

    return keyBy(mapOverlays, 'id');
  };

  /**
   * Find accessible grouped MapOverlays, starting from the top level MapOverlayGroups
   * @param {*} accessibleMapOverlays
   */
  findAccessibleGroupedMapOverlays = async accessibleMapOverlays => {
    //Find all the top level Map Overlay Groups
    const mapOverlayGroups = await MapOverlayGroup.find({
      top_level: {
        comparator: '=',
        comparisonValue: true,
      },
    });

    const mapOverlayGroupIdToName = reduceToDictionary(mapOverlayGroups, 'id', 'name');
    const mapOverlayGroupIds = mapOverlayGroups.map(mapOverlayGroup => mapOverlayGroup.id);

    const mapOverlayGroupRelations = await MapOverlayGroupRelation.find({
      map_overlay_group_id: {
        comparator: 'IN',
        comparisonValue: mapOverlayGroupIds,
      },
    });

    const mapOverlayGroupMapOverlaysGroupedByGroupId = groupBy(
      mapOverlayGroupRelations,
      'map_overlay_group_id',
    );

    const groupIds = Object.keys(mapOverlayGroupMapOverlaysGroupedByGroupId);
    const result = {};

    for (let i = 0; i < groupIds.length; i++) {
      const groupId = groupIds[i];
      const name = mapOverlayGroupIdToName[groupId];
      const mapOverlayGroupConnections = mapOverlayGroupMapOverlaysGroupedByGroupId[groupId];
      const nestedMapOverlayGroups = await this.findNestedGroupedMapOverlays(
        mapOverlayGroupConnections,
        accessibleMapOverlays,
      );

      const isNonEmptyMapOverlayGroup = this.checkIfGroupedMapOverlaysAreEmpty(
        nestedMapOverlayGroups,
      );

      if (isNonEmptyMapOverlayGroup) {
        result[name] = nestedMapOverlayGroups;
      }
    }

    return result;
  };

  /**
   * Recursively find the nested grouped MapOverlays.
   * @param {*} mapOverlayGroupConnections
   * @param {*} accessibleMapOverlays
   */
  findNestedGroupedMapOverlays = async (mapOverlayGroupConnections, accessibleMapOverlays) => {
    let results = [];

    if (!mapOverlayGroupConnections || !mapOverlayGroupConnections.length) {
      return results;
    }

    const areMapOverlays = this.checkRelationsChildType(mapOverlayGroupConnections, 'mapOverlay');

    //If all of the connections are mapOverlays, this means we have reached the lowest level of the hierarchy
    if (areMapOverlays) {
      const mapOverlayIds = mapOverlayGroupConnections.map(
        mapOverlayGroupConnection => mapOverlayGroupConnection.child_id,
      );
      const mapOverlays = Object.values(accessibleMapOverlays).filter(mapOverlay =>
        mapOverlayIds.includes(mapOverlay.id),
      );

      results = this.translateOverlaysForResponse(mapOverlays);
    } else {
      //Find all the child MapOverlayGroups
      const mapOverlayGroupIds = mapOverlayGroupConnections.map(m => m.child_id);
      const mapOverlayGroups = await MapOverlayGroup.find({
        id: {
          comparator: 'IN',
          comparisonValue: mapOverlayGroupIds,
        },
      });
      const mapOverlayGroupIdToName = reduceToDictionary(mapOverlayGroups, 'id', 'name');

      //Recursively find the children of the current MapOverlayGroups
      for (let i = 0; i < mapOverlayGroupConnections.length; i++) {
        const mapOverlayGroupConnection = mapOverlayGroupConnections[i];
        const name = mapOverlayGroupIdToName[mapOverlayGroupConnection.child_id];
        const type = 'mapOverlayGroup';
        const childMapOverlayGroupRelations = await MapOverlayGroupRelation.find({
          map_overlay_group_id: {
            comparator: '=',
            comparisonValue: mapOverlayGroupConnection.child_id,
          },
        });
        const children = await this.findNestedGroupedMapOverlays(
          childMapOverlayGroupRelations,
          accessibleMapOverlays,
        );
        const areMapOverlayGroups = this.checkRelationsChildType(
          childMapOverlayGroupRelations,
          'mapOverlayGroup',
        );

        //If children are all groups, sort by names.
        if (areMapOverlayGroups) {
          children.sort(({ name: a }, { name: b }) =>
            a.toLowerCase().localeCompare(b.toLowerCase()),
          );
        }

        results.push({
          name,
          type,
          children,
        });
      }
    }

    return results;
  };

  checkRelationsChildType = (connections, childType) => {
    return connections.every(
      mapOverlayGroupConnection => mapOverlayGroupConnection.child_type === childType,
    );
  };

  checkIfGroupedMapOverlaysAreEmpty = nestedMapOverlayGroups => {
    if (!nestedMapOverlayGroups || !nestedMapOverlayGroups.length) {
      return false;
    }

    return nestedMapOverlayGroups.every(({ type, children }) => {
      if (type === 'mapOverlay') {
        return true;
      } else if (type === 'mapOverlayGroup' && children && children.length) {
        return this.checkIfGroupedMapOverlaysAreEmpty(children);
      }

      return false;
    });
  };

  translateOverlaysForResponse = mapOverlays => {
    const translatedMapOverlays = [];

    mapOverlays
      .filter(({ presentationOptions: { hideFromMenu } }) => !hideFromMenu)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach(({ id, name, linkedMeasures, presentationOptions }) => {
        const idString = [id, ...(linkedMeasures || [])].sort().join(',');

        translatedMapOverlays.push({
          measureId: idString,
          name,
          ...presentationOptions,
          type: 'mapOverlay',
        });
      });

    return translatedMapOverlays;
  };
}

/*
*** data builder from:
[  {
    id: 84,
    measureGroupName: 'Water and Sanitation',
    userGroup: 'Public',
    measureName: 'Clean water',
    dataElementCode: 'BCD29' },
   {
    id: 85,
    measureGroupName: 'Water and Sanitation',
    userGroup: 'Public',
    measureName: 'Is the main source of water drinkable?',
    dataElementCode: 'BCD31' },
   {
    id: 86,
    measureGroupName: 'Water and Sanitation',
    userGroup: 'Public',
    measureName: 'Functional toilet for patients?',
    dataElementCode: 'BCD32' },
   {
    id: 93,
    measureGroupName: 'Electricity',
    userGroup: 'Public',
    measureName: 'Electricity',
    dataElementCode: 'SS9' },
   {
    id: 94,
    measureGroupName: 'Electricity',
    userGroup: 'Public',
    measureName: 'Main source of electricity',
    dataElementCode: 'SS20' },
   {
    id: 95,
    measureGroupName: 'Electricity',
    userGroup: 'Public',
    measureName: 'Functional generator',
    dataElementCode: 'SS25' },
   {
    id: 96,
    measureGroupName: 'Electricity',
    userGroup: 'Public',
    measureName: 'Functional solar power',
    dataElementCode: 'SS26' },
   {
    id: 107,
    measureGroupName: 'Cold Chain',
    userGroup: 'Public',
    measureName: 'Working fridge',
    dataElementCode: 'BCD25' },
   {
    id: 125,
    measureGroupName: 'Services provided',
    userGroup: 'Public',
    measureName: 'Inpatient facilities',
    dataElementCode: 'FF6' },
   {
    id: 126,
    measureGroupName: 'Services provided',
    userGroup: 'Public',
    measureName: 'Basic first aid and life support',
    dataElementCode: 'DP5' },
   {
    id: 127,
    measureGroupName: 'Services provided',
    userGroup: 'Public',
    measureName: 'Initial wound care',
    dataElementCode: 'DP6' },
   {
    id: 128,
    measureGroupName: 'Services provided',
    userGroup: 'Public',
    measureName: 'Contraception',
    dataElementCode: 'SS106' },
   {
    id: 129,
    measureGroupName: 'Services provided',
    userGroup: 'Public',
    measureName: 'Antenatal care',
    dataElementCode: 'SS120' },
   {
    id: 130,
    measureGroupName: 'Services provided',
    userGroup: 'Public',
    measureName: 'Delivery of babies',
    dataElementCode: 'SS128' },
   {
    id: 131,
    measureGroupName: 'Services provided',
    userGroup: 'Public',
    measureName: 'Cesarean sections',
    dataElementCode: 'SS155' },
   {
    id: 132,
    measureGroupName: 'Services provided',
    userGroup: 'Public',
    measureName: 'Regular immunisation services',
    dataElementCode: 'SS157' },
   {
    id: 133,
    measureGroupName: 'Services provided',
    userGroup: 'Public',
    measureName: 'Diagnosis and management of TB',
    dataElementCode: 'SS190' },
   {
    id: 134,
    measureGroupName: 'Services provided',
    userGroup: 'Public',
    measureName: 'Diagnosis and treatment of malaria',
    dataElementCode: 'SS192' },
   {
    id: 135,
    measureGroupName: 'Services provided',
    userGroup: 'Public',
    measureName: 'Treatment for STIs (other than HIV)',
    dataElementCode: 'SS182' },
   {
    id: 155,
    measureGroupName: 'Laboratory and diagnosis',
    userGroup: 'Public',
    measureName: 'Cholesterol testing',
    dataElementCode: 'SS218' },
   {
    id: 156,
    measureGroupName: 'Laboratory and diagnosis',
    userGroup: 'Public',
    measureName: 'X-Ray Machine',
    dataElementCode: 'SS219' },
   {
    id: 157,
    measureGroupName: 'Laboratory and diagnosis',
    userGroup: 'Public',
    measureName: 'Ultrasound',
    dataElementCode: 'SS220' },
   {
    id: 158,
    measureGroupName: 'Laboratory and diagnosis',
    userGroup: 'Public',
    measureName: 'Pregnancy tests',
    dataElementCode: 'SS212' },
   {
    id: 159,
    measureGroupName: 'Laboratory and diagnosis',
    userGroup: 'Public',
    measureName: 'Malaria Rapid Diagnostic Test Kit',
    dataElementCode: 'BCD95' },
   {
    id: 160,
    measureGroupName: 'Laboratory and diagnosis',
    userGroup: 'Public',
    measureName: 'Blood Glucose testing',
    dataElementCode: 'SS215' } ]


*** data builder to:
{
    "organisationUnitType": "Country",
    "organisationUnitCode": "DL",
    "name": "Demo Land",
    "measures": {
        "Water and Sanitation": [
            {
                "measureId": 84,
                "name": "Clean water"
            },
            {
                "measureId": 85,
                "name": "Is the main source of water drinkable?"
            },
            {
                "measureId": 86,
                "name": "Functional toilet for patients?"
            }
        ],
        "Electricity": [
            {
                "measureId": 93,
                "name": "Electricity"
            },
            {
                "measureId": 94,
                "name": "Main source of electricity"
            },
            {
                "measureId": 95,
                "name": "Functional generator"
            },
            {
                "measureId": 96,
                "name": "Functional solar power"
            }
        ],
        "Cold Chain": [
            {
                "measureId": 107,
                "name": "Working fridge"
            }
        ],
        "Services provided": [
            {
                "measureId": 125,
                "name": "Inpatient facilities"
            },
            {
                "measureId": 126,
                "name": "Basic first aid and life support"
            },
            {
                "measureId": 127,
                "name": "Initial wound care"
            },
            {
                "measureId": 128,
                "name": "Contraception"
            },
            {
                "measureId": 129,
                "name": "Antenatal care"
            },
            {
                "measureId": 130,
                "name": "Delivery of babies"
            },
            {
                "measureId": 131,
                "name": "Cesarean sections"
            },
            {
                "measureId": 132,
                "name": "Regular immunisation services"
            },
            {
                "measureId": 133,
                "name": "Diagnosis and management of TB"
            },
            {
                "measureId": 134,
                "name": "Diagnosis and treatment of malaria"
            },
            {
                "measureId": 135,
                "name": "Treatment for STIs (other than HIV)"
            }
        ],
        "Laboratory and diagnosis": [
            {
                "measureId": 155,
                "name": "Cholesterol testing"
            },
            {
                "measureId": 156,
                "name": "X-Ray Machine"
            },
            {
                "measureId": 157,
                "name": "Ultrasound"
            },
            {
                "measureId": 158,
                "name": "Pregnancy tests"
            },
            {
                "measureId": 159,
                "name": "Malaria Rapid Diagnostic Test Kit"
            },
            {
                "measureId": 160,
                "name": "Blood Glucose testing"
            }
        ]
    }
}
*/
