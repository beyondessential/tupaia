/**
 * Tupaia
 * Copyright (c) 2017 - 2019 Beyond Essential Systems Pty Ltd
 **/

import winston from 'winston';

import { utcMoment, getSortByKey } from '@tupaia/utils';
import { DhisFetcher } from './DhisFetcher';
import { DHIS2_RESOURCE_TYPES } from './types';
import { aggregateResults } from './aggregation';
import { getEventDataValueMap } from './getEventDataValueMap';
import { replaceElementIdsWithCodesInEvents } from './replaceElementIdsWithCodesInEvents';
import { translateEventResponse } from './translateEventResponse';
import { translateDataValueResponse } from './translateDataValueResponse';
import { RESPONSE_TYPES } from './responseUtils';

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

export const REGIONAL_SERVER_NAME = 'regional';
const LATEST_LOOKBACK_PERIOD = '600d';

const getServerUrlFromName = serverName => {
  const isProduction = process.env.IS_PRODUCTION_ENVIRONMENT === 'true';
  const devPrefix = isProduction ? '' : 'dev-';
  const specificServerPrefix = '' || serverName === REGIONAL_SERVER_NAME ? '' : `${serverName}-`;
  return `https://${devPrefix}${specificServerPrefix}aggregation.tupaia.org`;
};

export class DhisApi {
  constructor(serverName = REGIONAL_SERVER_NAME) {
    this.serverName = serverName;
    const serverUrl = getServerUrlFromName(serverName);
    this.fetcher = new DhisFetcher(serverUrl, this.constructError);
    this.deleteEvent = this.deleteEvent.bind(this);
  }

  /**
   * Constructs a new error, subclasses may override to customise error behaviour
   * @param {string} message    The error message
   * @param {string} [dhisUrl]  The url that was requested (unused here, useful in subclass)
   */
  constructError(message, dhisUrl) {
    return new Error(message);
  }

  /**
   * Constructs a new QueryBuilder for making query replacements. The web-config-server implementation
   * involves database access, so it should not be pulled into the database free dhis-api package
   */
  constructQueryBuilder() {
    throw new Error(
      'You are attempting to use a method that requires a QueryBuilder, please subclass DhisApi and implement constructQueryBuilder',
    );
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
      query.filter.code = `[${codes.join(',')}]`;
    }
    if (ids) {
      query.filter.id = `[${ids.join(',')}]`;
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
    return this.postData(DATA_VALUE_SET, { dataValues: data });
  }

  async postDataSetCompletion(data) {
    return this.postData(DATA_SET_COMPLETION, { completeDataSetRegistrations: [data] });
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
      fields: ['id'],
    });
    return records && records.map(({ id }) => id);
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
        dataValues: getEventDataValueMap(event),
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
    return this.postData(EVENT, { events });
  }

  /**
   * @param {string} eventId
   * @param {EventData} event
   * @returns {Promise<string>}
   */
  async updateEvent(eventId, event) {
    return this.put(`events/${eventId}`, event);
  }

  /**
   * @param {Event[]} events
   * @returns {Promise<{ updated: number, errors: string[] }>}
   */
  async updateEvents(events) {
    const errors = [];
    let totalUpdatedCount = 0;

    for (let i = 0; i < events.length; i++) {
      let updated = 0;
      const eventId = events[i].event;

      try {
        const { response } = await this.updateEvent(eventId, events[i]);
        updated = parseInt(response.importCount.updated, 10);
      } catch (error) {
        errors.push(error.message);
      }

      totalUpdatedCount += updated;
    }

    return { updated: totalUpdatedCount, errors };
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

  async getAnalytics(originalQuery, replacementValues = {}, aggregationType, aggregationConfig) {
    const queryBuilder = this.constructQueryBuilder(originalQuery, replacementValues);
    queryBuilder.makeDimensionReplacements();
    const query = queryBuilder.makeCustomReplacements();

    // Add common defaults for input and output id schemes
    query.inputIdScheme = 'code';
    query.outputIdScheme = query.outputIdScheme || 'uid';

    // Transform the easily understood 'dataElementCodes', 'period', etc. to DHIS2 language
    const {
      dataElementCodes,
      dataElementGroupCode,
      dataElementGroupCodes,
      measureCriteria,
      organisationUnitCode,
      period,
    } = query;
    const getDxString = () => {
      if (dataElementCodes) {
        return dataElementCodes.join(';');
      }
      return (dataElementGroupCodes || [dataElementGroupCode])
        .map(groupCode => `DE_GROUP-${groupCode}`)
        .join(';');
    };
    const dxString = getDxString();

    query.dimension = [`dx:${dxString}`, `pe:${period}`, `ou:${organisationUnitCode}`];
    query.includeMetadataDetails = true;

    const response = await this.fetch('analytics/rawData.json', this.sanitizeAnalyticsQuery(query));
    const { results, metadata } = translateDataValueResponse(response);
    const aggregatedResults = aggregateResults(results, aggregationType, aggregationConfig);

    let filteredResults = aggregatedResults;
    if (measureCriteria) {
      const { EQ, GT, GE, LT, LE } = measureCriteria;
      if (EQ) {
        filteredResults = filteredResults.filter(r => r.value == EQ); // eslint-disable-line eqeqeq
      }
      if (GT) {
        filteredResults = filteredResults.filter(r => r.value > GT);
      }
      if (GE) {
        filteredResults = filteredResults.filter(r => r.value >= GE);
      }
      if (LT) {
        filteredResults = filteredResults.filter(r => r.value < LT);
      }
      if (LE) {
        filteredResults = filteredResults.filter(r => r.value <= LE);
      }
    }

    return {
      results: filteredResults,
      metadata,
      period,
    };
  }

  /**
   * Sanitizes an analytics query to prevent the following DHIS errors:
   * 1. `Periods and start and end dates cannot be specified simultaneously`
   * 2. `Request-URI Too Large`
   */
  sanitizeAnalyticsQuery = query => {
    const sanitizedQuery = { ...query };

    if (query.period) {
      // [`startDate`, `endDate`] and `period` cannot be used at the same data value analytic query
      delete sanitizedQuery.startDate;
      delete sanitizedQuery.endDate;
    }

    // Remove redundant properties which can significantly increase the request uri
    delete sanitizedQuery.period;
    delete sanitizedQuery.dataElementCodes;
    delete sanitizedQuery.dataElementGroupCode;
    delete sanitizedQuery.dataElementGroupCodes;
    delete sanitizedQuery.organisationUnitCodes;

    return sanitizedQuery;
  };

  async getEventAnalytics(
    originalQuery,
    replacementValues = {},
    aggregationType,
    aggregationConfig = {},
  ) {
    const queryBuilder = this.constructQueryBuilder(originalQuery, replacementValues);
    queryBuilder.makeDimensionReplacements();
    queryBuilder.makeEventReplacements();
    const query = queryBuilder.makeCustomReplacements();
    const programCodes = query.programCodes || (query.programCode && [query.programCode]);

    let events;
    if (programCodes) {
      const nestedEvents = [
        ...(await Promise.all(
          programCodes.map(programCode => this.getEvents({ ...query, programCode })),
        )),
      ];

      events = [].concat(...nestedEvents); // Flatten all event results into a single array
    } else {
      events = await this.getEvents(query);
    }
    const { results, metadata } = await translateEventResponse(this, events, query);

    return {
      results: aggregateResults(results, aggregationType, aggregationConfig),
      metadata,
    };
  }

  async getDataValuesInSets(originalQuery, replacementValues, aggregationType, aggregationConfig) {
    const queryBuilder = this.constructQueryBuilder(originalQuery, replacementValues);
    await queryBuilder.buildOrganisationUnitCodes();
    const query = queryBuilder.makeCustomReplacements();
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

    const response = await this.fetch(DATA_VALUE_SET, query);
    if (!response.dataValues) return [];

    const aggregatedResults = aggregateResults(
      response.dataValues.map(result => ({ organisationUnit: result.orgUnit, ...result })),
      aggregationType,
      aggregationConfig,
    );

    return aggregatedResults;
  }

  async getOrganisationUnits(originalQuery, replacementValues) {
    const query = this.constructQueryBuilder(
      originalQuery,
      replacementValues,
    ).makeCustomReplacements();
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
      throw new Error(`No option set found for data element ${dataElementCode}`);
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
}
