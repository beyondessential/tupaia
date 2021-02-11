/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { translateElementKeysInEventAnalytics } from '@tupaia/dhis-api';

export class DhisInputSchemeResolvingApiProxy {
  constructor(models, api) {
    this.models = models;
    this.api = api;
  }

  async getAnalytics(query) {
    let modifiedQuery = { ...query };

    if (
      (await this.allDataElementsHaveDhisId(query)) &&
      (await this.allOrgUnitsHaveDhisId(query))
    ) {
      // the endpoint used /api/analytics/rawData.json only allows a single "inputIdScheme", which means
      // both the dataElements and orgUnits need to be ids
      modifiedQuery = await this.replaceDataElementCodesWithIds(modifiedQuery);
      modifiedQuery = await this.replaceOrgUnitCodesWithIds(modifiedQuery);
      modifiedQuery.inputIdScheme = 'uid';
    }

    return this.api.getAnalytics(modifiedQuery);
  }

  async getEventAnalytics(query) {
    let modifiedQuery = { ...query };

    // The base method here, DhisApi#getEventAnalytics will convert codes to ids before submitting the
    // actual data request. It does that with separate calls e.g. /api/dataElements. However, with dhis
    // setups where the Data Elements do not have codes, this api call will give us no new information.
    // To prevent this, we pre-emptively swap out codes for ids, using our internal mapping, so that
    // DhisApi#getEventAnalytics does not need to make these code-to-id conversion calls.
    const { dataElementIdScheme = 'code' } = query;

    const modifyDataElementsToUseDhisId = await this.allDataElementsHaveDhisId(query);

    if (modifyDataElementsToUseDhisId) {
      modifiedQuery = await this.replaceDataElementCodesWithIds(modifiedQuery);
      modifiedQuery.dataElementIdScheme = 'id';
    }

    if (await this.allProgramsHaveDhisId(query)) {
      modifiedQuery = await this.replaceProgramCodesWithIds(modifiedQuery);
    }

    if (await this.allOrgUnitsHaveDhisId(query)) {
      modifiedQuery = await this.replaceOrgUnitCodesWithIds(modifiedQuery);
    }

    const response = await this.api.getEventAnalytics(modifiedQuery);

    if (dataElementIdScheme !== 'code') {
      return response;
    }

    // The api response will contain data elements with ids, and DhisApi will not be able to translate these
    // back into codes (because the codes are not set in dhis). So, we have to do it ourselves using the internal
    // mapping.
    if (!modifyDataElementsToUseDhisId) {
      return response;
    }

    const dataElementIdToCode = {};

    const dataElements = await this.models.dataSource.find({
      code: query.dataElementCodes,
      type: 'dataElement',
    });

    for (const dataElement of dataElements) {
      if (dataElement.config.dhisId) {
        dataElementIdToCode[dataElement.config.dhisId] = dataElement.code;
      }
    }

    return translateElementKeysInEventAnalytics(response, dataElementIdToCode);
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
      if (!dataElement.config.dhisId) {
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
    const { programCode } = query;

    const dataGroups = await this.models.dataSource.find({ code: programCode, type: 'dataGroup' });

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

    const { programCode } = query;

    const dataGroup = await this.models.dataSource.findOne({
      code: programCode,
      type: 'dataGroup',
    });

    if (!dataGroup) {
      throw new Error(
        'Program/DataGroup not found in data_source, attempted to replace its code with an id',
      );
    }

    if (!dataGroup.config.dhisId) {
      throw new Error(
        'Program/DataGroup does not have a dhisId, attempted to replace its code with the id',
      );
    }

    modifiedQuery.programId = dataGroup.config.dhisId;
    delete modifiedQuery.programCode;
    return modifiedQuery;
  };
}
