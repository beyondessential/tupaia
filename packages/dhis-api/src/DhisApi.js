/**
 * Tupaia
 * Copyright (c) 2017 - 2019 Beyond Essential Systems Pty Ltd
 */

import winston from 'winston';
import keyBy from 'lodash.keyby';

import { aggregateAnalytics } from '@tupaia/aggregator';
import { CustomError, getSortByKey, utcMoment } from '@tupaia/utils';
import { DhisFetcher } from './DhisFetcher';
import { DHIS2_RESOURCE_TYPES } from './types';
import { replaceElementIdsWithCodesInEvents } from './replaceElementIdsWithCodesInEvents';
import { RESPONSE_TYPES, getDiagnosticsFromResponse } from './responseUtils';
import { buildAnalyticQueries } from './buildAnalyticQueries';

const {
  DATA_ELEMENT,
  DATA_ELEMENT_GROUP,
  DATA_SET,
  DATA_SET_COMPLETION,
  DATA_VALUE_SET,
  DATA_VALUE,
  EVENT,
  OPTION_SET,
  OPTION,
  ORGANISATION_UNIT,
  PROGRAM,
} = DHIS2_RESOURCE_TYPES;

const LATEST_LOOKBACK_PERIOD = '600d';

export class DhisApi {
  constructor(serverName, serverUrl) {
    this.serverName = serverName;
    this.serverUrl = serverUrl;
    this.fetcher = new DhisFetcher(serverName, serverUrl, this.constructError);
    this.deleteEvent = this.deleteEvent.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  getResourceTypes() {
    return DHIS2_RESOURCE_TYPES;
  }

  /**
   * Constructs a new error, subclasses may override to customise error behaviour
   * @param {string} message    The error message
   * @param {string} [dhisUrl]  The url that was requested (unused here, useful in subclass)
   */
  constructError(message, dhisUrl) {
    return new Error(message);
  }

  getServerName() {
    return this.serverName;
  }

  async fetch(endpoint, queryParameters, config) {
    return this.fetcher.fetch(endpoint, queryParameters, config);
  }

  // function return one record with [fields] of [type] matching it's id or code
  // if no units found will return null
  async getRecord({ type, id, code, fields = [':all'] }) {
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
      const uniqueCodes = [...new Set(codes)];
      query.filter.code = `[${uniqueCodes.join(',')}]`;
    }
    if (ids) {
      const uniqueIds = [...new Set(ids)];
      query.filter.id = `[${uniqueIds.join(',')}]`;
    }

    const response = await this.fetch(type, query);
    return response[type];
  }

  async fetchAllPages(endpoint, queryParameters) {
    let pager = { page: 1, pageCount: 0 };
    // The optimal page size for execution speed, resulting from a benchmark with page sizes of
    // [100, 500, 1000] and results sizes of [100, 500, 1000, 2000] records.
    // Above 1000, page size seems to have no further effect in the speed
    const optimalPageSize = 1000;

    const allResults = [];
    do {
      const results = await this.fetch(endpoint, {
        ...queryParameters,
        paging: true,
        page: pager.page,
        totalPages: true,
        pageSize: optimalPageSize,
      });
      allResults.push(...results[endpoint]);

      pager = results.pager;
      pager.page++;
    } while (pager.page <= pager.pageCount);

    return { [endpoint]: allResults };
  }

  async post(endpoint, data, queryParameters) {
    return this.fetch(endpoint, queryParameters, {
      body: JSON.stringify(data),
      method: 'POST',
    });
  }

  async put(endpoint, data, queryParameters) {
    return this.fetch(endpoint, queryParameters, {
      body: JSON.stringify(data),
      method: 'PUT',
    });
  }

  async delete(endpoint, queryParameters) {
    return this.fetch(endpoint, queryParameters, { method: 'DELETE' });
  }

  async postData(endpoint, data) {
    return this.post(endpoint, data, { idScheme: 'code', skipAudit: true });
  }

  async postDataValueSets(data) {
    const response = await this.postData(DATA_VALUE_SET, { dataValues: data });
    return getDiagnosticsFromResponse(response);
  }

  async postDataSetCompletion(data) {
    const response = await this.postData(DATA_SET_COMPLETION, {
      completeDataSetRegistrations: [data],
    });
    return getDiagnosticsFromResponse(response);
  }

  async updateAnalyticsTables() {
    const { response } = await this.post('resourceTables/analytics', { lastYears: 3 });
    const statusEndpoint = response.relativeNotifierEndpoint.substring('/api/'.length);
    return new Promise(resolve => this.waitForAnalyticsToComplete(statusEndpoint, resolve));
  }

  async waitForAnalyticsToComplete(statusEndpoint, resolve) {
    winston.info('Waiting for analytics update');
    const statusResponse = await this.fetch(statusEndpoint);
    if (statusResponse.find(resultItem => resultItem.completed === true)) {
      winston.info('Analytics update complete');
      resolve();
    } else {
      setTimeout(() => this.waitForAnalyticsToComplete(statusEndpoint, resolve), 1000);
    }
  }

  async getIdsFromCodes(recordType, recordCodes) {
    if (!recordCodes || recordCodes.length === 0) {
      throw this.constructError('Must provide codes to search for');
    }
    const records = await this.getRecords({
      type: recordType,
      codes: recordCodes,
      fields: ['code', 'id'],
    });
    if (!records) return null;
    // return ids in same order as provided codes
    const recordsByCode = keyBy(records, 'code');
    return recordCodes.map(c => {
      const record = recordsByCode[c];
      if (!record) throw new Error(`No ${recordType} matching ${c} on DHIS2`);
      return record.id;
    });
  }

  async getIdFromCode(recordType, recordCode) {
    if (!recordCode) {
      throw this.constructError('Must provide a code to search for');
    }
    const record = await this.getRecord({
      type: recordType,
      code: recordCode,
      fields: ['id'],
    });
    return record && record.id;
  }

  async getEvents({
    programCode,
    organisationUnitCode,
    orgUnitIdScheme = 'code',
    dataElementIdScheme = 'uid',
    startDate,
    endDate,
    eventId,
    trackedEntityInstance,
    dataValueFormat = 'array', // ('array'|'object')
  }) {
    if (!eventId && !trackedEntityInstance && !programCode) {
      throw this.constructError(
        'At least one of the following must be provided: eventId, trackedEntityInstance, programCode',
      );
    }

    const programId = programCode && (await this.getIdFromCode(PROGRAM, programCode));
    if (programCode && !programId) {
      throw this.constructError(`Program not found: ${programCode}`);
    }
    const organisationUnitId = organisationUnitCode
      ? await this.getIdFromCode(ORGANISATION_UNIT, organisationUnitCode)
      : null;

    const queryParameters = {
      program: programId,
      orgUnit: organisationUnitId,
      programIdScheme: 'code',
      orgUnitIdScheme,
      ouMode: 'DESCENDANTS',
      trackedEntityInstance,
    };

    // Format dates
    if (startDate) {
      queryParameters.startDate = utcMoment(startDate).format('YYYY-MM-DD');
    }
    if (endDate) {
      queryParameters.endDate = utcMoment(endDate).format('YYYY-MM-DD');
    }

    const endpoint = `events${eventId ? `/${eventId}` : ''}`;

    const response = eventId
      ? await this.fetch(endpoint, queryParameters)
      : await this.fetchAllPages(endpoint, queryParameters);

    let events = eventId ? [response] : response.events;
    if (dataElementIdScheme === 'code') {
      events = await replaceElementIdsWithCodesInEvents(this, events);
    }
    if (dataValueFormat === 'object') {
      events = events.map(event => ({
        ...event,
        dataValues: keyBy(event.dataValues, 'dataElement'),
      }));
    }
    events.sort(getSortByKey('eventDate'));

    return events;
  }

  /**
   * @param {EventData[]} events
   * @returns {Promise<string>}
   */
  async postEvents(events) {
    const response = await this.postData(EVENT, { events });
    return getDiagnosticsFromResponse(response);
  }

  /**
   * @param {string} eventId
   * @param {EventData} event
   * @returns {Promise<string>}
   */
  async updateEvent(eventId, event) {
    const response = await this.put(`events/${eventId}`, event);
    return getDiagnosticsFromResponse(response);
  }

  /**
   * @param {Event[]} events
   * @returns {Promise<{ updated: number, errors: string[] }>}
   */
  async updateEvents(events) {
    const errors = [];
    let totalUpdatedCount = 0;

    for (let i = 0; i < events.length; i++) {
      const eventId = events[i].event;

      try {
        const { counts } = await this.updateEvent(eventId, events[i]);
        totalUpdatedCount += counts.updated;
      } catch (error) {
        errors.push(error.message);
      }
    }

    return { counts: { updated: totalUpdatedCount }, errors };
  }

  async updateRecord(resourceType, record) {
    let existingId = record.id;
    if (!existingId && record.code) {
      existingId = await this.getIdFromCode(resourceType, record.code);
    }
    // If the resource already exists on DHIS2, update the existing one
    if (existingId) {
      const response = await this.put(`${resourceType}/${existingId}`, record);
      return getDiagnosticsFromResponse(response);
    }
    const response = await this.post(resourceType, record);
    return getDiagnosticsFromResponse(response);
  }

  async getAnalytics(originalQuery) {
    const queries = buildAnalyticQueries(originalQuery);

    let headers;
    let rows = [];
    let metaData;
    await Promise.all(
      queries.map(async query => {
        const { headers: newHeaders, rows: newRows, metaData: newMetadata } = await this.fetch(
          'analytics/rawData.json',
          query,
        );

        // Only the final batch's headers and metadata will be used in the result
        headers = newHeaders;
        metaData = newMetadata;
        rows = rows.concat(newRows);
      }),
    );

    return { headers, rows, metaData };
  }

  async buildDataValuesInSetsQuery(originalQuery) {
    const query = { ...originalQuery };
    const { dataSetCode, dataElementGroupCode, period, startDate, organisationUnitCodes } = query;

    if (!period && !startDate) {
      query.lastUpdatedDuration = LATEST_LOOKBACK_PERIOD;
    }

    // Attach relevant information into the query
    const organisationUnitIds = await this.getIdsFromCodes(
      ORGANISATION_UNIT,
      organisationUnitCodes,
    );
    query.orgUnit = organisationUnitIds;
    delete query.organisationUnitCodes;
    if (dataElementGroupCode) {
      const dataElementGroupResult = await this.getRecord({
        type: DATA_ELEMENT_GROUP,
        code: dataElementGroupCode,
        fields: 'id',
      });
      query.dataElementGroup = dataElementGroupResult.id;
    }
    if (dataSetCode) {
      const dataSetResult = await this.getRecord({
        type: DATA_SET,
        code: dataSetCode,
        fields: 'id',
      });
      query.dataSet = dataSetResult.id;
    }

    return query;
  }

  async getDataValuesInSets(originalQuery, aggregationType, aggregationConfig) {
    const query = await this.buildDataValuesInSetsQuery(originalQuery);
    const response = await this.fetch(DATA_VALUE_SET, query);
    if (!response.dataValues) return [];

    const aggregatedResults = aggregateAnalytics(
      response.dataValues.map(result => ({ organisationUnit: result.orgUnit, ...result })),
      aggregationType,
      aggregationConfig,
    );

    return aggregatedResults;
  }

  async getOrganisationUnits(query) {
    const { organisationUnits, pager } = await this.fetch(ORGANISATION_UNIT, query);
    return query.paging ? { organisationUnits, pager } : organisationUnits;
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
      return null;
    }
    const optionSetId = optionSetResponse.dataElements[0].optionSet.id;
    const response = await this.fetch(`${OPTION_SET}/${optionSetId}`, {
      fields: '[options]',
    });
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

  getOptionSetOptions = async ({ code, id }) => {
    const result = await this.getRecord({
      type: OPTION_SET,
      code,
      id,
      fields: 'options[code,name]',
    });
    if (result === null || !result.options || result.options.length === 0) {
      throw new CustomError({
        type: 'DHIS Communication error',
        description: 'Option set does not exist or has no options',
        dataElementGroups: code,
      });
    }

    const options = {};
    result.options.forEach(({ name, code: optionCode }) => {
      options[optionCode] = name.trim();
    });
    return options;
  };

  async getDataSetByCode(code) {
    return this.getRecord({ type: DATA_SET, code });
  }

  async deleteRecord(resourceType, code) {
    const recordId = await this.getIdFromCode(resourceType, code);
    if (!recordId) {
      throw new Error(`Attempted to delete a record from ${resourceType} that does not exist`);
    }
    return this.deleteRecordById(resourceType, recordId);
  }

  async deleteRecordById(resourceType, id) {
    const response = await this.delete(`${resourceType}/${id}`);
    return getDiagnosticsFromResponse(response, true);
  }

  async deleteWithQuery(endpoint, query) {
    try {
      // dhis2 returns empty response if successful, throws an error (409 status code) if it fails
      await this.delete(endpoint, query);
      return getDiagnosticsFromResponse({ responseType: RESPONSE_TYPES.DELETE }, true);
    } catch (error) {
      if (error.status === 409) {
        return getDiagnosticsFromResponse(
          {
            responseType: RESPONSE_TYPES.DELETE,
            errors: [error.message],
          },
          true,
        );
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
    const response = await this.delete(`${EVENT}/${eventReference}`, true);
    return getDiagnosticsFromResponse(response);
  }

  async deleteDataSetCompletion({ dataSet, period, organisationUnit }) {
    const query = {
      ds: dataSet,
      pe: period,
      ou: organisationUnit,
    };
    return this.deleteWithQuery(DATA_SET_COMPLETION, query);
  }
}
