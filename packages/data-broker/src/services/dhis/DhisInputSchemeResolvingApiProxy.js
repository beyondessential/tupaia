/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  translateElementKeysInEventAnalytics,
  translateElementsKeysAndCodeInAnalytics,
} from '@tupaia/dhis-api';
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { reduceToDictionary } from '@tupaia/utils';

export class DhisInputSchemeResolvingApiProxy {
  constructor(models, api) {
    this.models = models;
    this.api = api;
  }

  async getAnalytics(query) {
    let modifiedQuery = { ...query };

    const allDataElementsHaveDhisId = await this.allDataElementsHaveDhisId(query);
    const allOrgUnitsHaveDhisId = await this.allOrgUnitsHaveDhisId(query);

    if (allDataElementsHaveDhisId && allOrgUnitsHaveDhisId) {
      // the endpoint used /api/analytics/rawData.json only allows a single "inputIdScheme", which means
      // both the dataElements and orgUnits need to be ids
      modifiedQuery = await this.replaceDataElementCodesWithIds(modifiedQuery);
      modifiedQuery = await this.replaceOrgUnitCodesWithIds(modifiedQuery);
      modifiedQuery.inputIdScheme = 'uid';
      modifiedQuery.outputIdScheme = 'uid';
    }

    const response = await this.api.getAnalytics(modifiedQuery);

    let translatedResponse = { ...response };

    // The api response will contain data elements with ids, and DhisApi will not be able to translate these
    // back into codes (because the codes are not set in dhis). So, we have to do it ourselves using the internal
    // mapping.
    if (allDataElementsHaveDhisId) {
      translatedResponse = await this.translateDataElementIdsToCodesInResponse(
        translatedResponse,
        query.dataElementCodes,
        false,
      );
    }

    // It's a little bit more complex with org units, as dhis may return
    // different org units than were requested
    translatedResponse = await this.translateOrgUnitIdsToCodesInResponse(translatedResponse);
    return translatedResponse;
  }

  async getEventAnalytics(query) {
    let modifiedQuery = { ...query };

    // The base method here, DhisApi#getEventAnalytics will convert codes to ids before submitting the
    // actual data request. It does that with separate calls e.g. /api/dataElements. However, with dhis
    // setups where the Data Elements do not have codes, this api call will give us no new information.
    // To prevent this, we pre-emptively swap out codes for ids, using our internal mapping, so that
    // DhisApi#getEventAnalytics does not need to make these code-to-id conversion calls.
    const { dataElementIdScheme = 'code' } = query;

    const allDataElementsHaveDhisId = await this.allDataElementsHaveDhisId(query);
    const allProgramsHaveDhisId = await this.allProgramsHaveDhisId(query);
    const allOrgUnitsHaveDhisId = await this.allOrgUnitsHaveDhisId(query);

    if (allDataElementsHaveDhisId) {
      modifiedQuery = await this.replaceDataElementCodesWithIds(modifiedQuery);
      modifiedQuery.dataElementIdScheme = 'id';
    }

    if (allProgramsHaveDhisId) {
      modifiedQuery = await this.replaceProgramCodesWithIds(modifiedQuery);
    }

    if (allOrgUnitsHaveDhisId) {
      modifiedQuery = await this.replaceOrgUnitCodesWithIds(modifiedQuery);
    }

    if (allDataElementsHaveDhisId && allProgramsHaveDhisId && allOrgUnitsHaveDhisId) {
      modifiedQuery.inputIdScheme = 'uid';
    }

    const response = await this.api.getEventAnalytics(modifiedQuery);

    let translatedResponse = { ...response };

    // The api response will contain data elements with ids, and DhisApi will not be able to translate these
    // back into codes (because the codes are not set in dhis). So, we have to do it ourselves using the internal
    // mapping.
    if (allDataElementsHaveDhisId && dataElementIdScheme === 'code') {
      translatedResponse = await this.translateDataElementIdsToCodesInResponse(
        translatedResponse,
        query.dataElementCodes,
        true,
      );
    }

    // It's a little bit more complex with org units, as dhis may return
    // different org units than were requested
    translatedResponse = await this.translateOrgUnitIdsToCodesInResponse(translatedResponse);

    return translatedResponse;
  }

  /**
   * @param query {*}
   * @returns bool
   * @private
   */
  allDataElementsHaveDhisId = async query => {
    const { dataElementCodes } = query;

    const dataElements = await this.models.dataSource.find({
      code: dataElementCodes,
      type: 'dataElement',
    });

    for (const dataElementCode of dataElementCodes) {
      const dataElement = dataElements.find(d => d.code === dataElementCode);
      if (!dataElement?.config?.dhisId) {
        return false;
      }
    }

    return true;
  };

  /**
   * @param query {*}
   * @returns bool
   * @private
   */
  allOrgUnitsHaveDhisId = async query => {
    const { organisationUnitCode, organisationUnitCodes } = query;

    const orgUnitCodes = organisationUnitCode ? [organisationUnitCode] : organisationUnitCodes;

    const mappings = await this.models.dataServiceEntity.find({ entity_code: orgUnitCodes });

    for (const orgUnitCode of orgUnitCodes) {
      const mapping = mappings.find(m => m.entity_code === orgUnitCode);

      if (!mapping) {
        return false;
      }
    }

    return true;
  };

  /**
   * @param query {*}
   * @returns bool
   * @private
   */
  allProgramsHaveDhisId = async query => {
    const programCodes = query.programCode ? [query.programCode] : query.programCodes || [];

    const dataGroups = await this.models.dataSource.find({ code: programCodes, type: 'dataGroup' });

    for (const dataGroup of dataGroups) {
      if (!dataGroup.config.dhisId) {
        return false;
      }
    }

    return true;
  };

  /**
   * @param query {*}
   * @returns {*}
   * @private
   */
  replaceDataElementCodesWithIds = async query => {
    const modifiedQuery = { ...query, dataElementIds: [] };

    const { dataElementCodes } = query;

    const dataElements = await this.models.dataSource.find({
      code: dataElementCodes,
      type: 'dataElement',
    });

    for (const dataElementCode of dataElementCodes) {
      const dataElement = dataElements.find(d => d.code === dataElementCode);

      if (!dataElement) {
        throw new Error(
          'DataElement not found in data_source, attempted to replace its code with an id',
        );
      }

      if (!dataElement.config.dhisId) {
        throw new Error(
          'DataElement does not have a dhisId, attempted to replace its code with the id',
        );
      }

      modifiedQuery.dataElementIds.push(dataElement.config.dhisId);
    }

    delete modifiedQuery.dataElementCodes;
    return modifiedQuery;
  };

  /**
   * @param response {*}
   * @param dataElementCodes {*}
   * @returns {*}
   * @private
   */
  translateDataElementIdsToCodesInResponse = async (response, dataElementCodes, isEventBased) => {
    const dataElementIdToCode = {};

    const dataElements = await this.models.dataSource.find({
      code: dataElementCodes,
      type: 'dataElement',
    });

    for (const dataElement of dataElements) {
      if (dataElement.config.dhisId) {
        dataElementIdToCode[dataElement.config.dhisId] = dataElement.code;
      }
    }

    return isEventBased
      ? translateElementKeysInEventAnalytics(response, dataElementIdToCode)
      : translateElementsKeysAndCodeInAnalytics(response, dataElementIdToCode);
  };

  /**
   * @param response {*}
   * @returns {*}
   * @private
   */
  translateOrgUnitIdsToCodesInResponse = async response => {
    if (!response?.rows?.length) return response;

    const orgUnitIdIndex = response.headers.findIndex(({ name }) => name === 'ou');
    let orgUnitCodeIndex = response.headers.findIndex(({ name }) => name === 'oucode');

    if (orgUnitIdIndex === -1) {
      throw new Error('Can\'t read org unit id from dhis');
    }

    const hasOuCode = orgUnitCodeIndex !== -1;

    const dhisIds = response.rows.map(row => row[orgUnitIdIndex]);

    let mappings = [];
    // need to batch this query because we can get an SQL error if we do too many
    // TODO convert to using `runDatabaseFunctionInBatches` or one of its wrappers
    const SQL_BIND_CHUNK_SIZE = 1000;
    for (let i = 0; i < dhisIds.length; i += SQL_BIND_CHUNK_SIZE) {
      const chunkDhisIds = dhisIds.slice(i, i + SQL_BIND_CHUNK_SIZE);
      const chunkMappings = await this.models.dataServiceEntity.find({
        [QUERY_CONJUNCTIONS.RAW]: {
          sql: `config->>'dhis_id' in (${chunkDhisIds.map(() => '?')})`,
          parameters: chunkDhisIds,
        },
      });
      mappings = [...mappings, ...chunkMappings];
    }

    const mappingsByDhisId = reduceToDictionary(mappings, el => el.config.dhis_id, 'entity_code');

    if (!hasOuCode) {
      // we need to modify the response to add org unit codes in
      // TODO: clean up in #2504
      // Normally with code based api/analytics/rawData.json call, the response includes the code. We need the dhisId in the
      // response for each org unit, so we have to change the outputIdScheme to uid, which means org unit code no longer comes
      // back. So we add it back in manually.
      response.headers.push({
        name: 'oucode'
      });
      orgUnitCodeIndex = response.headers.findIndex(({ name }) => name === 'oucode');
      // set org unit code to UNKNOWN, which will be the default if we dont have the mapping in the next block
      response.rows.map(row => {
        row[orgUnitCodeIndex] = 'UNKNOWN';
      });
    }

    const newRows = response.rows.map(row => {
      const newRow = [...row];
      const dhisId = row[orgUnitIdIndex];
      const entityCode = mappingsByDhisId[dhisId];
      if (entityCode) newRow[orgUnitCodeIndex] = entityCode;
      return newRow;
    });

    return { ...response, rows: newRows };
  };

  /**
   * @param query {*}
   * @returns {*}
   * @private
   */
  replaceOrgUnitCodesWithIds = async query => {
    const modifiedQuery = { ...query, organisationUnitIds: [] };

    const { organisationUnitCode, organisationUnitCodes } = query;

    const orgUnitCodes = organisationUnitCode ? [organisationUnitCode] : organisationUnitCodes;

    const mappings = await this.models.dataServiceEntity.find({ entity_code: orgUnitCodes });

    for (const orgUnitCode of orgUnitCodes) {
      const mapping = mappings.find(m => m.entity_code === orgUnitCode);

      if (!mapping) {
        throw new Error(
          'Org Unit not found in data_service_entity, attempted to replace its code with the id',
        );
      }

      if (!mapping.config.dhis_id) {
        throw new Error('Mapping config in data_service_entity does not include required dhis_id');
      }

      modifiedQuery.organisationUnitIds.push(mapping.config.dhis_id);
    }

    delete modifiedQuery.organisationUnitCode;
    delete modifiedQuery.organisationUnitCodes;
    return modifiedQuery;
  };

  /**
   * @param query {*}
   * @returns {*}
   * @private
   */
  replaceProgramCodesWithIds = async query => {
    const modifiedQuery = { ...query };

    const programCodes = query.programCode ? [query.programCode] : query.programCodes || [];

    if (programCodes.length === 0) {
      throw new Error('No program codes to replace');
    }

    const dataGroups = await this.models.dataSource.find({
      code: programCodes,
      type: 'dataGroup',
    });

    const programIds = [];

    for (const programCode of programCodes) {
      const dataGroup = dataGroups.find(d => d.code === programCode);

      if (!dataGroup) {
        throw new Error(
          `Program/DataGroup ${programCode} not found in data_source, attempted to replace its code with an id`,
        );
      }

      if (!dataGroup.config.dhisId) {
        throw new Error(
          `Program/DataGroup ${programCode} does not have a dhisId, attempted to replace its code with the id`,
        );
      }

      programIds.push(dataGroup.config.dhisId);
    }

    modifiedQuery.programIds = programIds;
    delete modifiedQuery.programCode;
    delete modifiedQuery.programCodes;
    return modifiedQuery;
  };
}
