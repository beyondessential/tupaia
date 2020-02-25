/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';
import { ORG_UNIT_ENTITY_TYPES } from '../../../database';
import { EntityPusher } from './EntityPusher';

const { ORGANISATION_UNIT, ORGANISATION_UNIT_GROUP } = DHIS2_RESOURCE_TYPES;
const { COUNTRY, REGION, FACILITY, WORLD, VILLAGE } = ORG_UNIT_ENTITY_TYPES;
const MAXIMUM_SHORT_NAME_LENGTH = 50;

const LEVEL_DETAILS_ACCESSORS_BY_SERVER = {
  regional: {
    [COUNTRY]: () => ({
      dhisLevelIndex: 2,
      levelName: 'Country',
    }),
    [FACILITY]: () => ({
      dhisLevelIndex: 5,
      levelName: 'Facility',
    }),
    [VILLAGE]: () => ({
      dhisLevelIndex: 6,
      levelName: 'Village',
    }),
    [REGION]: async entity => {
      // Within regions, we have both districts and subdistricts. If the parent is the country, it
      // must be a district
      if (await entity.hasCountryParent()) {
        return {
          dhisLevelIndex: 3,
          levelName: 'District',
        };
      }
      return {
        dhisLevelIndex: 4,
        levelName: 'Subdistrict',
      };
    },
  },
  tonga: {
    [COUNTRY]: () => ({
      dhisLevelIndex: 2,
      levelName: 'Country',
    }),
    [REGION]: () => ({
      dhisLevelIndex: 3,
      levelName: 'Island Group',
    }),
    [FACILITY]: () => ({
      dhisLevelIndex: 4,
      levelName: 'Facility',
    }),
    [VILLAGE]: () => ({
      dhisLevelIndex: 5,
      levelName: 'Village',
    }),
  },
};

function getFacilityTypeCollectionName(typeName) {
  const edgeCases = {
    Dispensary: 'Dispensaries',
    'Provincial administration': 'Provincial administration',
    'National administration': 'National administration',
    Other: 'Other',
    Storage: 'Storage',
  };
  return edgeCases[typeName] || `${typeName}s`;
}

export class OrganisationUnitPusher extends EntityPusher {
  async getExistingOrganisationUnitGroup(code) {
    return this.api.getRecord({ type: ORGANISATION_UNIT_GROUP, code });
  }

  async createOrganisationUnitGroup(code, constructDetails) {
    const details = await constructDetails(code);
    details.shortName = details.name.substring(0, MAXIMUM_SHORT_NAME_LENGTH);
    await this.api.updateRecord(ORGANISATION_UNIT_GROUP, details);
    return this.getExistingOrganisationUnitGroup(code);
  }

  async getOrCreateOrganisationUnitGroup(code, constructDetails) {
    const existingGroup = await this.getExistingOrganisationUnitGroup(code);
    return existingGroup || this.createOrganisationUnitGroup(code, constructDetails);
  }

  async addFacilityToOrganisationUnitGroup(code, constructDetails, organisationUnitId) {
    const organisationUnitGroup = await this.getOrCreateOrganisationUnitGroup(
      code,
      constructDetails,
    );
    if (!organisationUnitGroup.organisationUnits) {
      // Currently no children, add empty array to push children on to
      organisationUnitGroup.organisationUnits = [];
    }
    organisationUnitGroup.organisationUnits.push({ id: organisationUnitId });
    await this.api.updateRecord(ORGANISATION_UNIT_GROUP, organisationUnitGroup);
  }

  async updateFacilityTypeGroup({ country_code: countryCode, code }, organisationUnitId) {
    const { type_name: typeName, type } = await this.models.facility.findOne({ code });
    const typeCollectionName = getFacilityTypeCollectionName(typeName);
    const organisationUnitGroupCode = `FacilityType_${countryCode}_${type}_${typeCollectionName}`;
    const constructDetails = async () => {
      // No existing group; create an organisation unit group for this facility type/country combo
      const country = await this.models.entity.findOne({ code: countryCode });
      const organisationUnitGroupName = `${country.name} Facility Type: ${typeCollectionName}`;
      return {
        code: organisationUnitGroupCode,
        name: organisationUnitGroupName,
      };
    };
    await this.addFacilityToOrganisationUnitGroup(
      organisationUnitGroupCode,
      constructDetails,
      organisationUnitId,
    );
  }

  async getIsInPacific(entity) {
    const { organisationUnits: pacificCountries } = await this.api.getRecord({
      type: ORGANISATION_UNIT_GROUP,
      code: 'Pacific_Countries',
      fields: ['organisationUnits[code]'],
    });
    return pacificCountries.find(country => country.code === entity.country_code);
  }

  /**
   * Gets all of the organisation unit groups a facility should be added to, creating those that don't
   * already exist
   * @param {object} entity
   */
  async updateOrganisationUnitGroupsForFacility(entity) {
    const organisationUnitId = await this.api.getIdFromCode(ORGANISATION_UNIT, entity.code);
    // Add to an organisation unit group of facilities for every ancestor
    const constructGroupDetails = async code => {
      // No existing group; create an organisation unit group for this facility type/country combo
      const ancestor = await this.models.entity.findOne({ code });
      const organisationUnitGroupName = `${ancestor.name} Facilities`;
      return {
        code,
        name: organisationUnitGroupName,
      };
    };

    // Add to org unit groups for ancestors up to
    //   - but excluding "World" for facilities outside of the Pacific
    //   - and including "World" for facilities in Pacific countries (which should be shown on the
    //     regional dashboard)
    const shouldBeAddedToWorld = await this.getIsInPacific(entity);
    let ancestor = await this.models.entity.findById(entity.parent_id);
    while (ancestor && (ancestor.type !== WORLD || shouldBeAddedToWorld)) {
      await this.addFacilityToOrganisationUnitGroup(
        ancestor.code,
        constructGroupDetails,
        organisationUnitId,
      );
      ancestor = await this.models.entity.findById(ancestor.parent_id);
    }

    // Add to the facility type organisation unit group for the country
    await this.updateFacilityTypeGroup(entity, organisationUnitId);
  }

  /**
   * Create any organisation unit groups needed and add the facility to them
   * @param {object} entity
   */
  async addEntityToOrganisationUnitGroups(entity) {
    const { type } = entity;
    if (type !== FACILITY) {
      // Only facilities need to be added to organisation unit groups
      return;
    }
    // Add this facility to all required organisation groups with facility as the owner
    await this.updateOrganisationUnitGroupsForFacility(entity);
  }

  /**
   * Delete all organisation unit groups that are based on the existence of the organisation
   * unit code provided, e.g. if Demo Land were deleted, code would be 'DL', and the "Demo Land
   * Facilities" group would need deleting, along with any facility type groups
   * @param {string} organisationUnitCode   The code of the organisation unit being deleted
   */
  async deleteGroupsOwnedByOrganisationUnit(organisationUnitCode) {
    const organisationUnitGroups = await this.api.getRecords({
      type: ORGANISATION_UNIT_GROUP,
      filter: { code: organisationUnitCode, comparator: 'like' },
    });
    await Promise.all(
      organisationUnitGroups.map(async ({ code }) => {
        // Need to get rid of all organisation unit children associated before delete will work
        const group = await this.api.getExistingOrganisationUnitGroup(code);
        await this.api.updateRecord(ORGANISATION_UNIT_GROUP, { ...group, organisationUnits: [] });
        return this.api.deleteRecord(ORGANISATION_UNIT_GROUP, code);
      }),
    );
  }

  async getLevelDetails(entity) {
    const serverName = this.api.getServerName();
    const levelDetailsAccessors = LEVEL_DETAILS_ACCESSORS_BY_SERVER[serverName];
    if (!levelDetailsAccessors) {
      throw new Error(`Unsupported server for entity sync ${serverName}`);
    }
    const levelDetailsAccessor = levelDetailsAccessors[entity.type];
    if (!levelDetailsAccessor) {
      throw new Error(`Unsupported entity type ${entity.type} being pushed to DHIS2`);
    }
    return levelDetailsAccessor(entity);
  }

  async createOrUpdate() {
    const entity = await this.fetchEntity();
    const { code, name, parent_id: parentId } = entity;

    const parent = await this.models.entity.findById(parentId);

    const parentOrganisationUnitId = await this.api.getIdFromCode(ORGANISATION_UNIT, parent.code);
    if (!parentOrganisationUnitId) {
      return false; // Can't add this organisation unit to DHIS2 if its parent hasn't been added
    }

    // Compose the body of the POST to dhis2
    const { dhisLevelIndex, levelName } = await this.getLevelDetails(entity);
    const organisationUnitDetails = {
      level: dhisLevelIndex,
      name,
      shortName: name,
      code,
      description: JSON.stringify({ level: levelName }),
      openingDate: '2017-01-01T00:00:00.000', // Set the opening date to before Tupaia existed
      parent: {
        id: parentOrganisationUnitId,
      },
    };
    const diagnostics = await this.api.updateRecord(ORGANISATION_UNIT, organisationUnitDetails);
    await this.addEntityToOrganisationUnitGroups(entity);
    const data = await entity.getData();
    return { ...diagnostics, data };
  }

  async delete() {
    const { code: organisationUnitCode } = await this.fetchDataFromSyncLog();
    const diagnostics = await this.api.deleteRecord(ORGANISATION_UNIT, organisationUnitCode);

    // Delete organisation unit groups matching this organisation unit's code
    await this.deleteGroupsOwnedByOrganisationUnit(organisationUnitCode);

    return diagnostics;
  }
}
