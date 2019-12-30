/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DhisFetcher } from './DhisFetcher';
import { getIsProductionEnvironment } from '../../devops';
import { DHIS2_RESOURCE_TYPES } from './types';
import { RESPONSE_TYPES } from '../responseUtils';

const {
  DATA_ELEMENT,
  DATA_SET,
  DATA_SET_COMPLETION,
  DATA_VALUE_SET,
  DATA_VALUE,
  EVENT,
  OPTION_SET,
  OPTION,
  ORGANISATION_UNIT,
} = DHIS2_RESOURCE_TYPES;

export const REGIONAL_SERVER_NAME = 'regional';

export class DhisApi {
  constructor(serverName = REGIONAL_SERVER_NAME) {
    this.serverName = serverName;
    const devPrefix = getIsProductionEnvironment() ? '' : 'dev-';
    const specificServerPrefix = serverName === REGIONAL_SERVER_NAME ? '' : `${serverName}-`;
    const serverUrl = `https://${devPrefix}${specificServerPrefix}aggregation.tupaia.org`;
    this.fetcher = new DhisFetcher(serverUrl);
    this.deleteEvent = this.deleteEvent.bind(this);
  }

  getServerName() {
    return this.serverName;
  }

  async fetch(endpoint, queryParameters, config) {
    return this.fetcher.fetch(endpoint, queryParameters, config);
  }

  async put(endpoint, data, queryParameters) {
    return this.fetch(endpoint, queryParameters, { body: JSON.stringify(data), method: 'PUT' });
  }

  async post(endpoint, data, queryParameters) {
    return this.fetch(endpoint, queryParameters, { body: JSON.stringify(data), method: 'POST' });
  }

  async delete(endpoint, query = {}) {
    return this.fetch(endpoint, query, { method: 'DELETE' });
  }

  // function return one record with [fields] of [type] matching it's id or code
  // if no units found will return null
  async getRecord({ type, id, code, fields = ':all' }) {
    const query = { fields };
    if (code) {
      query.filter = { code };
    }
    const endpoint = `${type}${id ? `/${id}` : ''}`;
    const response = await this.fetch(endpoint, query);
    if (id) {
      return response;
    }
    try {
      return response[type].length > 0 ? response[type][0] : null;
    } catch (err) {
      return null;
    }
  }

  // function return any records with [fields] of [type] matching the provided ids, codes, or filter
  async getRecords({ type, ids, codes, filter, fields }) {
    const query = { fields, filter: filter || { comparator: 'in' } };
    if (codes) {
      query.filter.code = `[${codes.join(',')}]`;
    }
    if (ids) {
      query.filter.id = `[${ids.join(',')}]`;
    }
    const response = await this.fetch(type, query);
    return response[type];
  }

  async getIdFromCode(resourceType, code) {
    if (!code) {
      throw new Error('Must provide a code to search for');
    }
    const record = await this.getRecord({
      type: resourceType,
      code,
      fields: 'id',
    });
    return record && record.id;
  }

  async postData(endpoint, data) {
    return this.post(endpoint, data, { idScheme: 'code', skipAudit: true });
  }

  async postEvent(data) {
    return this.postData(EVENT, data);
  }

  async postDataValueSet(data) {
    return this.postData(DATA_VALUE_SET, data);
  }

  async postDataSetCompletion(data) {
    return this.postData(DATA_SET_COMPLETION, { completeDataSetRegistrations: [data] });
  }

  async updateRecord(resourceType, record) {
    let existingId = record.id;
    if (!existingId && record.code) {
      existingId = await this.getIdFromCode(resourceType, record.code);
    }
    // If the resource already exists on DHIS2, update the existing one
    if (existingId) {
      return this.put(`${resourceType}/${existingId}`, record);
    }
    return this.post(resourceType, record);
  }

  async deleteRecord(resourceType, code) {
    const recordId = await this.getIdFromCode(resourceType, code);
    if (!recordId) {
      throw new Error(`Attempted to delete a record from ${resourceType} that does not exist`);
    }
    return this.deleteRecordById(resourceType, recordId);
  }

  async deleteRecordById(resourceType, id) {
    return this.delete(`${resourceType}/${id}`);
  }

  async deleteWithQuery(endpoint, query) {
    try {
      // dhis2 returns empty response if successful, throws an error (409 status code) if it fails
      await this.delete(endpoint, query);
      return { responseType: RESPONSE_TYPES.DELETE };
    } catch (error) {
      if (error.status === 409) {
        return { responseType: RESPONSE_TYPES.DELETE, errors: [error.message] };
      }
      throw error;
    }
  }

  async deleteDataValue({ dataElement: dataElementCode, period, orgUnit: organisationUnitCode }) {
    const dataElementId = await this.getIdFromCode(DATA_ELEMENT, dataElementCode);
    if (!dataElementId) {
      throw new Error(`No data element with code ${dataElementCode}`);
    }
    const organisationUnitId = await this.getIdFromCode(ORGANISATION_UNIT, organisationUnitCode);
    if (!organisationUnitId) {
      throw new Error(`Organisation unit ${organisationUnitCode} does not exist`);
    }

    const query = {
      de: dataElementId,
      pe: period,
      ou: organisationUnitId,
    };
    return this.deleteWithQuery(DATA_VALUE, query);
  }

  async deleteEvent(eventReference) {
    return this.delete(`${EVENT}/${eventReference}`);
  }

  async deleteDataSetCompletion({ dataSet, period, organisationUnit }) {
    const query = {
      ds: dataSet,
      pe: period,
      ou: organisationUnit,
    };
    return this.deleteWithQuery(DATA_SET_COMPLETION, query);
  }

  async getDataSetByCode(code) {
    return this.getRecord({ type: DATA_SET, code });
  }

  async getOptionsForDataElement(dataElementCode) {
    const query = {
      filter: `code:eq:${dataElementCode}`,
      fields: 'optionSet',
    };
    const optionSetResponse = await this.fetch(DATA_ELEMENT, query);
    if (
      !optionSetResponse ||
      !optionSetResponse.dataElements ||
      optionSetResponse.dataElements.length === 0 ||
      !optionSetResponse.dataElements[0].optionSet
    ) {
      throw new Error(`No option set found for data element ${dataElementCode}`);
    }
    const optionSetId = optionSetResponse.dataElements[0].optionSet.id;
    const response = await this.fetch(`${OPTION_SET}/${optionSetId}`, { fields: '[options]' });
    const options = {};
    await Promise.all(
      response.options.map(async ({ id: optionId }) => {
        const option = await this.fetch(`${OPTION}/${optionId}`, { fields: '[name,code]' });
        const { name: optionText, code: optionCode } = option;
        options[optionText.toLowerCase()] = optionCode; // Convert text to lower case so we can ignore case
      }),
    );
    return options;
  }
}
