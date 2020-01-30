/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import winston from 'winston';

import { getEventDataValueMap, replaceElementIdsWithCodesInEvents } from '/apiV1/utils';
import { fetch, getSortByKey, stringifyDhisQuery, utcMoment } from '/utils';
import { authenticateWithDhis } from './authenticateWithDhis';
import { Dhis2Error } from '/errors';
import { translateEventResponse } from './translateEventResponse';
import { translateDataValueResponse } from './translateDataValueResponse';
import { QueryBuilder } from './QueryBuilder';
import { aggregateResults } from './aggregation';

export const REGIONAL_SERVER_NAME = 'regional';
const LATEST_LOOKBACK_PERIOD = '600d';

const getServerUrlFromName = serverName => {
  const devPrefix = process.env.IS_PRODUCTION_ENVIRONMENT === 'true' ? '' : 'dev-';
  const specificServerPrefix = '' || serverName === REGIONAL_SERVER_NAME ? '' : `${serverName}-`;
  return `https://${devPrefix}${specificServerPrefix}aggregation.tupaia.org`;
};

export class DhisApi {
  constructor(serverName) {
    this.serverName = serverName;
    this.serverUrl = getServerUrlFromName(serverName);
  }

  async requestAccessToken() {
    const { token } = await authenticateWithDhis(this.serverName, this.serverUrl);
    this.accessTokenExpiry = token.expires_at.valueOf(); // expires_at is a Date
    return token.access_token;
  }

  clearAccessToken() {
    this.accessTokenPromise = null;
    this.accessTokenExpiry = null;
  }

  async getAccessToken() {
    const currentServerTime = Date.now();
    if (this.accessTokenExpiry && currentServerTime > this.accessTokenExpiry) {
      // token is expired, clear it
      this.clearAccessToken();
    }

    if (!this.accessTokenPromise) {
      // Not currently running an auth request, start one
      this.accessTokenPromise = this.requestAccessToken();
    }

    try {
      const accessToken = await this.accessTokenPromise;
      return accessToken;
    } catch (e) {
      this.clearAccessToken();
      throw new Error(`Authentication with DHIS2 failed: ${e.message}`);
    }
  }

  /**
   * Provides a simple fetch-like API for communicating with DHIS2 aggregation server. Takes care of
   * the auth and the base URL, so consumer just needs to pass through the endpoint (with any query
   * string included on the end) and any additional fetch config (e.g. the request body)
   */
  async fetch(endpoint, queryParameters = {}, customFetchConfig = {}, shouldRetryOnBadAuth) {
    const accessToken = await this.getAccessToken();
    const fetchConfig = {
      method: 'GET', // Acts as default http method, will be overridden if method passed in config
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      ...customFetchConfig,
    };
    const queryString = stringifyDhisQuery({ paging: false, ...queryParameters }); // Turn off dhis2 paging unless explicitly defined
    const url = `${this.serverUrl}/api/${endpoint}${queryString}`;
    winston.debug('DHIS2 request', { url, endpoint, ...queryParameters });
    const response = await fetch(url, fetchConfig);

    if (response.ok) {
      try {
        const responseObject = await response.json();
        return responseObject;
      } catch (error) {
        // deletes return an invalid body for json() to parse.
        if (error.type === 'invalid-json' && customFetchConfig.method === 'DELETE') return {};
        if (response.statusText) throw new Dhis2Error({ message: response.statusText }, url);
        throw new Dhis2Error({ message: error.message }, url);
      }
    }

    if (response.status === 401 && shouldRetryOnBadAuth) {
      this.clearAccessToken(); // Clear the current access token to force a new one on next fetch
      await this.getAccessToken();
      return this.fetch(endpoint, queryParameters, customFetchConfig, false);
    }
    let errorMessage = response.statusText;
    try {
      const { message } = await response.json();
      errorMessage += `: ${message}`;
    } catch (error) {
      // Don't worry if the response could not be parsed as json, we are already in an error state
    }

    throw new Dhis2Error({ message: errorMessage }, url);
  }

  // function return one record with [fields] of [type] matching it's id or code
  // if no units found will return null
  async getRecord({ type, id, code, fields }) {
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

  // function return any records with [fields] of [type] matching the provided ids or codes
  async getRecords({ type, ids, codes, fields }) {
    const query = { fields, filter: { comparator: 'in' } };
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
    return this.fetch(endpoint, queryParameters, { body: JSON.stringify(data), method: 'POST' });
  }

  async put(endpoint, data, queryParameters) {
    return this.fetch(endpoint, queryParameters, { body: JSON.stringify(data), method: 'PUT' });
  }

  async delete(endpoint, queryParameters) {
    return this.fetch(endpoint, queryParameters, { method: 'DELETE' });
  }

  async postDataValueSets(data) {
    return this.post('dataValueSets', { dataValues: data }, { idScheme: 'code', skipAudit: true });
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
      throw new Error('Must provide codes to search for');
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
      throw new Error('Must provide a code to search for');
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
      throw new Error(
        'At least one of the following must be provided: eventId, trackedEntityInstance, programCode',
      );
    }

    const programId = programCode && (await this.getIdFromCode('programs', programCode));
    if (programCode && !programId) {
      throw new Error(`Program not found: ${programCode}`);
    }
    const organisationUnitId = organisationUnitCode
      ? await this.getIdFromCode('organisationUnits', organisationUnitCode)
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
    return this.post('events', { events });
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

  async getAnalytics(originalQuery, replacementValues = {}, aggregationType, aggregationConfig) {
    const queryBuilder = new QueryBuilder(originalQuery, replacementValues);
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
    const queryBuilder = new QueryBuilder(originalQuery, replacementValues);
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
    const queryBuilder = new QueryBuilder(originalQuery, replacementValues);
    await queryBuilder.buildOrganisationUnitCodes();
    const query = queryBuilder.makeCustomReplacements();
    const { dataSetCode, dataElementGroupCode, period, startDate, organisationUnitCodes } = query;

    if (!period && !startDate) {
      query.lastUpdatedDuration = LATEST_LOOKBACK_PERIOD;
    }

    // Attach relevant information into the query
    const organisationUnitIds = await this.getIdsFromCodes(
      'organisationUnits',
      organisationUnitCodes,
    );
    query.orgUnit = organisationUnitIds;
    delete query.organisationUnitCodes;
    if (dataElementGroupCode) {
      const dataElementGroupResult = await this.getRecord({
        type: 'dataElementGroups',
        code: dataElementGroupCode,
        fields: 'id',
      });
      query.dataElementGroup = dataElementGroupResult.id;
    }
    if (dataSetCode) {
      const dataSetResult = await this.getRecord({
        type: 'dataSets',
        code: dataSetCode,
        fields: 'id',
      });
      query.dataSet = dataSetResult.id;
    }

    const response = await this.fetch('dataValueSets', query);
    if (!response.dataValues) return [];

    const aggregatedResults = aggregateResults(
      response.dataValues.map(result => ({ organisationUnit: result.orgUnit, ...result })),
      aggregationType,
      aggregationConfig,
    );

    return aggregatedResults;
  }

  async getOrganisationUnits(originalQuery, replacementValues) {
    const query = new QueryBuilder(originalQuery, replacementValues).makeCustomReplacements();
    const { organisationUnits, pager } = await this.fetch('organisationUnits', query);
    return query.paging ? { organisationUnits, pager } : organisationUnits;
  }

  async deleteDataValue(dataElementCode, period, organisationUnitCode) {
    const dataElementId = await this.getIdFromCode('dataElements', dataElementCode);
    if (!dataElementId) {
      throw new Error(`No data element with code ${dataElementCode}`);
    }
    const organisationUnitId = await this.getIdFromCode('organisationUnits', organisationUnitCode);
    if (!organisationUnitId) {
      throw new Error(`Organisation unit ${organisationUnitCode} does not exist`);
    }

    const query = {
      de: dataElementId,
      pe: period,
      ou: organisationUnitId,
    };
    try {
      await this.delete('dataValues', query);
      return true;
    } catch (error) {
      throw new Dhis2Error({ message: error.message });
    }
  }
}
