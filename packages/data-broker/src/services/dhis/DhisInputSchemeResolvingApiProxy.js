/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  translateElementKeysInEventAnalytics,
  translateMetadataInAnalytics,
} from '@tupaia/dhis-api';
import { runDatabaseFunctionInBatches } from '@tupaia/database';
import { reduceToDictionary } from '@tupaia/utils';

export class DhisInputSchemeResolvingApiProxy {
  constructor(models, api) {
    this.models = models;
    this.api = api;
  }

  async getAnalyticsByMethod(query, getAnalyticsMethod) {
    const { dataElementCodes } = query;
    const { organisationUnitCode, organisationUnitCodes } = query;
    const orgUnitCodes = organisationUnitCode ? [organisationUnitCode] : organisationUnitCodes;
    const allDataElementsHaveDhisId = await this.allDataElementsHaveDhisId(dataElementCodes);
    const allOrgUnitsHaveDhisId = await this.allOrgUnitsHaveDhisId(orgUnitCodes);
    const modifiedQuery = await this.getModifiedAnalyticsQuery(
      query,
      allDataElementsHaveDhisId,
      allOrgUnitsHaveDhisId,
    );
    const response = await getAnalyticsMethod(modifiedQuery);

    return this.getTranslatedAnalyticsResponse(
      response,
      dataElementCodes,
      orgUnitCodes,
      allDataElementsHaveDhisId,
      allOrgUnitsHaveDhisId,
    );
  }

  async getAnalytics(query) {
    const getAnalyticsMethod = this.api.getAnalytics.bind(this);
    return this.getAnalyticsByMethod(query, getAnalyticsMethod);
  }

  async getAggregatedAnalytics(query) {
    const getAnalyticsMethod = this.api.getAggregatedAnalytics.bind(this);
    return this.getAnalyticsByMethod(query, getAnalyticsMethod);
  }

  async getModifiedAnalyticsQuery(query, allDataElementsHaveDhisId, allOrgUnitsHaveDhisId) {
    let modifiedQuery = { ...query };

    if (allDataElementsHaveDhisId && allOrgUnitsHaveDhisId) {
      // the analytics endpoints only allow a single "inputIdScheme", which means
      // both the dataElements and orgUnits need to be ids
      modifiedQuery = await this.replaceDataElementCodesWithIds(modifiedQuery);
      modifiedQuery = await this.replaceOrgUnitCodesWithIds(modifiedQuery);
      modifiedQuery.inputIdScheme = 'uid';
      modifiedQuery.outputIdScheme = 'uid';
    }

    return modifiedQuery;
  }

  async getTranslatedAnalyticsResponse(
    response,
    dataElementCodes,
    orgUnitCodes,
    allDataElementsHaveDhisId,
    allOrgUnitsHaveDhisId,
  ) {
    let translatedResponse = { ...response };

    // If all data elements have dhisId, it implies that we are using internal mapping and likely there are no data element codes on DHIS2
    // So we are translate them from ids to our internal data element codes here.
    if (allDataElementsHaveDhisId) {
      const dataElementIdToCode = await this.getDataElementDhisIdToCode(dataElementCodes);
      translatedResponse = translateMetadataInAnalytics(
        translatedResponse,
        dataElementIdToCode,
        'dx',
        'code',
      );
    }

    // Similar to data elements above, translating org unit ids to our internal entity codes.
    if (allOrgUnitsHaveDhisId) {
      const entityIdToCode = await this.getEntityDhisIdToCode(orgUnitCodes);
      // It's a little bit more complex with org units, as dhis may return
      // different org units than were requested
      translatedResponse = translateMetadataInAnalytics(
        translatedResponse,
        entityIdToCode,
        'ou',
        'code',
      );
    }

    return this.translateDefaultCoInResponse(translatedResponse);
  }

  translateDefaultCoInResponse = response => {
    if (!response?.rows?.length) return response;
    const coIndex = response.headers.findIndex(({ name }) => name === 'co');
    if (coIndex < 0) return response;

    const { metaData } = response;
    const defaultCoItem = Object.values(metaData.items).find(item => item.name === 'default');
    if (defaultCoItem) {
      const { uid: coId } = defaultCoItem;
      metaData.items[coId].code = 'default';
    }

    return { ...response, metaData };
  };

  async getEntityDhisIdToCode(orgUnitCodes) {
    const orgUnitIdToCode = {};
    const mappings = await this.models.dataServiceEntity.find({ entity_code: orgUnitCodes });

    for (const orgUnitCode of orgUnitCodes) {
      const mapping = mappings.find(m => m.entity_code === orgUnitCode);
      if (!mapping) {
        throw new Error('Org Unit not found in data_service_entity');
      }
      if (!mapping.config.dhis_id) {
        throw new Error('Mapping config in data_service_entity does not include required dhis_id');
      }
      orgUnitIdToCode[mapping.config.dhis_id] = orgUnitCode;
    }

    return orgUnitIdToCode;
  }

  async getDataElementDhisIdToCode(dataElementCodes) {
    const dataElementIdToCode = {};
    const dataElements = await this.models.dataSource.find({
      code: dataElementCodes,
      type: 'dataElement',
    });

    for (const dataElement of dataElements) {
      if (!dataElement.config.dhisId) {
        throw new Error('Data element does not have dhisId');
      }
      dataElementIdToCode[dataElement.config.dhisId] = dataElement.code;
    }

    return dataElementIdToCode;
  }

  async getEventAnalytics(query) {
    let modifiedQuery = { ...query };

    // The base method here, DhisApi#getEventAnalytics will convert codes to ids before submitting the
    // actual data request. It does that with separate calls e.g. /api/dataElements. However, with dhis
    // setups where the Data Elements do not have codes, this api call will give us no new information.
    // To prevent this, we pre-emptively swap out codes for ids, using our internal mapping, so that
    // DhisApi#getEventAnalytics does not need to make these code-to-id conversion calls.
    const { dataElementCodes, dataElementIdScheme = 'code' } = query;
    const programCodes = query.programCode ? [query.programCode] : query.programCodes || [];
    const { organisationUnitCode, organisationUnitCodes } = query;
    const orgUnitCodes = organisationUnitCode ? [organisationUnitCode] : organisationUnitCodes;
    const allDataElementsHaveDhisId = await this.allDataElementsHaveDhisId(dataElementCodes);
    const allProgramsHaveDhisId = await this.allProgramsHaveDhisId(programCodes);
    const allOrgUnitsHaveDhisId = await this.allOrgUnitsHaveDhisId(orgUnitCodes);

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
      translatedResponse = await this.translateDataElementIdsToCodesInEventAnalyticResponse(
        translatedResponse,
        query.dataElementCodes,
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
  allDataElementsHaveDhisId = async dataElementCodes => {
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
  allOrgUnitsHaveDhisId = async orgUnitCodes => {
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
  allProgramsHaveDhisId = async programCodes => {
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
  translateDataElementIdsToCodesInEventAnalyticResponse = async (response, dataElementCodes) => {
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

    return translateElementKeysInEventAnalytics(response, dataElementIdToCode);
  };

  /**
   * @param response {*}
   * @returns {*}
   * @private
   */
  translateOrgUnitIdsToCodesInResponse = async response => {
    if (!response?.rows?.length) return response;

    const orgUnitIdIndex = response.headers.findIndex(({ name }) => name === 'ou');
    const orgUnitCodeIndex = response.headers.findIndex(({ name }) => name === 'oucode');
    if (orgUnitIdIndex === -1 || orgUnitCodeIndex === -1)
      throw new Error("Can't read org unit id/code from dhis");

    const dhisIds = response.rows.map(row => row[orgUnitIdIndex]);
    const mappings = await runDatabaseFunctionInBatches(dhisIds, async batchOfRecords =>
      this.models.dataServiceEntity.find({
        'config->>dhis_id': batchOfRecords,
      }),
    );

    const mappingsByDhisId = reduceToDictionary(mappings, el => el.config.dhis_id, 'entity_code');

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

  async fetchIndicators(query) {
    let modifiedQuery = { ...query };
    const { dataElementCodes } = query;
    const allDataElementsHaveDhisId = await this.allDataElementsHaveDhisId(dataElementCodes);

    if (allDataElementsHaveDhisId) {
      modifiedQuery = await this.replaceDataElementCodesWithIds(modifiedQuery);
    }

    return this.api.fetchIndicators(modifiedQuery);
  }
}
