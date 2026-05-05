import { uniq } from 'es-toolkit';
import winston from 'winston';

import { aggregateAnalytics } from '@tupaia/aggregator';
import { utcMoment } from '@tupaia/tsutils';
import { CustomError, getSortByKey, reduceToDictionary } from '@tupaia/utils';
import { DhisFetcher } from './DhisFetcher';
import { DHIS2_RESOURCE_TYPES } from './types';
import {
  translateElementIdsToCodesInEvents,
  translateElementKeysInEventAnalytics,
} from './translateDataElementKeys';
import { RESPONSE_TYPES, getDiagnosticsFromResponse } from './responseUtils';
import {
  buildDataValueAnalyticsQueries,
  buildAggregatedDataValueAnalyticsQueries,
  buildEventAnalyticsQueries,
} from './buildAnalyticsQuery';

const {
  CATEGORY_OPTION_COMBO,
  DATA_ELEMENT,
  DATA_ELEMENT_GROUP,
  DATA_SET,
  DATA_SET_COMPLETION,
  DATA_VALUE_SET,
  DATA_VALUE,
  EVENT,
  OPTION_SET,
  ORGANISATION_UNIT,
  PROGRAM,
  INDICATOR,
} = DHIS2_RESOURCE_TYPES;

const LATEST_LOOKBACK_PERIOD = '3650d';

export class DhisApi {
  constructor(serverName, serverUrl, serverReadOnly = false) {
    this.serverName = serverName;
    this.serverUrl = serverUrl;
    this.serverReadOnly = serverReadOnly;
    this.fetcher = new DhisFetcher(serverName, serverUrl, this.constructError);
    this.deleteEvent = this.deleteEvent.bind(this);
  }

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
      const uniqueCodes = uniq(codes);
      query.filter.code = `[${uniqueCodes.join(',')}]`;
    }
    if (ids) {
      const uniqueIds = uniq(ids);
      query.filter.id = `[${uniqueIds.join(',')}]`;
    }

    const response = await this.fetch(type, query);
    return response[type];
  }

  async codesToIds(type, codes) {
    if (!codes || codes.length === 0) {
      return [];
    }

    const records = await this.getRecords({ type, codes, fields: ['id'] });
    return records.map(({ id }) => id);
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
    if (this.serverReadOnly) {
      throw new Error(`Attempted to push data to ${this.serverName} that should not be pushed`);
    }

    return this.fetch(endpoint, queryParameters, {
      body: JSON.stringify(data),
      method: 'POST',
    });
  }

  async put(endpoint, data, queryParameters) {
    if (this.serverReadOnly) {
      throw new Error(`Attempted to push data to ${this.serverName} that should not be pushed`);
    }

    return this.fetch(endpoint, queryParameters, {
      body: JSON.stringify(data),
      method: 'PUT',
    });
  }

  async delete(endpoint, queryParameters) {
    if (this.serverReadOnly) {
      throw new Error(`Attempted to delete data to ${this.serverName} that should not be deleted`);
    }

    return this.fetch(endpoint, queryParameters, { method: 'DELETE' });
  }

  async postData(endpoint, data, queryParameters = {}) {
    const { idScheme = 'code', orgUnitIdScheme, programIdScheme } = queryParameters;

    return this.post(endpoint, data, {
      idScheme,
      orgUnitIdScheme,
      programIdScheme,
      skipAudit: true,
    });
  }

  async postDataValueSets(data) {
    const response = await this.postData(DATA_VALUE_SET, { dataValues: data });
    return getDiagnosticsFromResponse(response);
  }

  async postDataSetCompletion(data) {
    const response = await this.postData(
      DATA_SET_COMPLETION,
      {
        completeDataSetRegistrations: [data],
      },
      {
        idScheme: 'id',
      },
    );
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

  async programCodeToId(programCode) {
    const programId = await this.getIdFromCode(PROGRAM, programCode);
    if (!programId) {
      throw this.constructError(`Program not found: ${programCode}`);
    }
    return programId;
  }

  async getEvents({
    programId,
    programCode,
    organisationUnitId,
    organisationUnitCode,
    orgUnitIdScheme = 'code',
    dataElementIdScheme = 'uid',
    startDate,
    endDate,
    eventId,
    trackedEntityInstance,
    dataValueFormat = 'object', // ('array'|'object')
  }) {
    if (!eventId && !trackedEntityInstance && !programCode) {
      throw this.constructError(
        'At least one of the following must be provided: eventId, trackedEntityInstance, programCode',
      );
    }

    const resolvedProgramId =
      programId || (programCode && (await this.programCodeToId(programCode)));

    const resolvedOrganisationUnitId =
      organisationUnitId ||
      (organisationUnitCode
        ? await this.getIdFromCode(ORGANISATION_UNIT, organisationUnitCode)
        : null);

    const queryParameters = {
      program: resolvedProgramId,
      orgUnit: resolvedOrganisationUnitId,
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
      events = await translateElementIdsToCodesInEvents(this, events);
    }
    if (dataValueFormat === 'object') {
      events = events.map(event => ({
        ...event,
        dataValues: reduceToDictionary(event.dataValues, 'dataElement', 'value'),
      }));
    }
    events.sort(getSortByKey('eventDate'));

    return events;
  }

  async postEvents(events) {
    const queryParameters = {
      idScheme: 'uid',
      orgUnitIdScheme: 'code',
      programIdScheme: 'code',
    };

    const response = await this.postData(EVENT, { events }, queryParameters);
    return getDiagnosticsFromResponse(response);
  }

  async updateEvent(eventId, event) {
    const response = await this.put(`events/${eventId}`, event);
    return getDiagnosticsFromResponse(response);
  }

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
    const queries = buildDataValueAnalyticsQueries(originalQuery);
    return this.fetchAnalyticsQueries(queries, 'analytics/rawData.json');
  }

  async getAggregatedAnalytics(originalQuery) {
    const queries = buildAggregatedDataValueAnalyticsQueries(originalQuery);
    return this.fetchAnalyticsQueries(queries, 'analytics.json');
  }

  async getEventAnalytics(originalQuery) {
    const {
      programId,
      programIds,
      programCode,
      programCodes,
      dataElementIds,
      dataElementCodes,
      organisationUnitIds,
      organisationUnitCodes,
      dataElementIdScheme = 'code',
      period,
      startDate,
      endDate,
      ...restOfOriginalQuery
    } = originalQuery;

    if (programCodes && programCodes.length > 1) {
      throw new Error('Maximum of one program code can be specified');
    }
    if (programIds && programIds.length > 1) {
      throw new Error('Maximum of one program id can be specified');
    }

    const endpoint = await this.buildEventAnalyticsEndpoint(
      programIds ? programIds[0] : programId,
      programCodes ? programCodes[0] : programCode,
    );

    let resolvedDataElementIds = dataElementIds;
    if (!dataElementIds) {
      if (dataElementCodes.length === 0) {
        resolvedDataElementIds = [];
      } else {
        // We use `fetchDataElements()` to leverage data element caching
        const dataElements = await this.fetchDataElements(dataElementCodes);
        resolvedDataElementIds = dataElements.map(({ id }) => id);
      }
    }

    const resolvedOrganisationUnitIds =
      organisationUnitIds || (await this.codesToIds(ORGANISATION_UNIT, organisationUnitCodes));

    const queries = await buildEventAnalyticsQueries({
      dataElementIds: resolvedDataElementIds,
      organisationUnitIds: resolvedOrganisationUnitIds,
      period,
      startDate,
      endDate,
      ...restOfOriginalQuery,
    });

    const response = await this.fetchAnalyticsQueries(queries, endpoint);
    if (dataElementIdScheme !== 'code') {
      return response;
    }

    // translate response to be code based
    const dataElements = await this.fetchDataElements(dataElementCodes);
    const dataElementIdToCode = reduceToDictionary(dataElements, 'id', 'code');
    return translateElementKeysInEventAnalytics(response, dataElementIdToCode);
  }

  /**
   * @returns {{ headers: any, metaData: any, rows: string[][] }}
   * @private
   */
  async fetchAnalyticsQueries(queries, endpoint) {
    let headers;
    let rows = [];
    let metaData;

    await Promise.all(
      queries.map(async query => {
        const {
          headers: newHeaders,
          rows: newRows,
          metaData: newMetadata,
        } = await this.fetch(endpoint, query);

        // Only the final batch's headers and metadata will be used in the result
        headers = newHeaders;
        metaData = newMetadata;
        rows = rows.concat(newRows);
      }),
    );

    return { headers, rows, metaData };
  }

  async buildEventAnalyticsEndpoint(programId, programCode) {
    const resolvedProgramId = programId || (await this.programCodeToId(programCode));
    return `analytics/events/query/${resolvedProgramId}`;
  }

  async buildDataValuesInSetsQuery(originalQuery) {
    const query = { ...originalQuery };
    const { dataSetCode, dataElementGroupCode, period, startDate, organisationUnitCodes } = query;

    if (!period && !startDate) {
      query.lastUpdatedDuration = LATEST_LOOKBACK_PERIOD;
    }

    // Attach relevant information into the query
    const organisationUnitIds = (
      await this.getRecords({
        type: ORGANISATION_UNIT,
        codes: organisationUnitCodes,
        fields: ['id'],
      })
    ).map(o => o.id);
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

  async fetchDataElements(dataElementCodes, { additionalFields = [], includeOptions } = {}) {
    if (dataElementCodes.length === 0) {
      return [];
    }

    const fields = ['id', 'code', 'name', ...additionalFields];
    if (includeOptions) fields.push('optionSet');
    const dataElements = await this.getRecords({
      type: DATA_ELEMENT,
      codes: dataElementCodes,
      fields,
    });
    if (includeOptions) {
      const optionSetIds = uniq(dataElements.filter(d => !!d.optionSet).map(d => d.optionSet.id));
      if (optionSetIds.length === 0) return dataElements;
      const optionSets = await this.getRecords({
        type: OPTION_SET,
        ids: optionSetIds,
        fields: 'id,options[code,name]',
      });
      const optionSetOptionsById = {};
      optionSets.forEach(({ id, ...restOfOptionSet }) => {
        optionSetOptionsById[id] = this.buildOptionsFromOptionSet(restOfOptionSet);
      });

      return dataElements.map(({ optionSet, ...restOfDataElement }) => {
        if (optionSet) {
          return {
            options: optionSetOptionsById[optionSet.id],
            ...restOfDataElement,
          };
        }
        return restOfDataElement;
      });
    }
    return dataElements;
  }

  async fetchDataGroup(dataGroupCode, dataElementCodes, includeOptions) {
    if (!dataGroupCode) {
      throw new Error('Please provide a data group code');
    }

    const dataGroup = await this.getRecord({
      type: PROGRAM,
      codes: [dataGroupCode],
      fields: ['code', 'name'],
    });

    if (!dataGroup) {
      throw new Error(`Cannot find Data Group: ${dataGroupCode}`);
    }

    const dataElementsMetadata = await this.fetchDataElements(dataElementCodes, { includeOptions });

    const dataGroupMetadata = {
      ...dataGroup,
      dataElements: dataElementsMetadata,
    };

    return dataGroupMetadata;
  }

  async fetchCategoryOptionCombos(categoryOptionComboCodes, { additionalFields = [] } = {}) {
    if (categoryOptionComboCodes.length === 0) {
      return [];
    }

    const fields = ['id', 'code', 'name', ...additionalFields];
    const categoryOptionCombos = await this.getRecords({
      type: CATEGORY_OPTION_COMBO,
      codes: categoryOptionComboCodes,
      fields,
    });

    return categoryOptionCombos;
  }

  buildFetchIndicatorsQuery = queryInput => {
    const { dataElementIds, dataElementCodes } = queryInput;

    if (!dataElementIds && !dataElementCodes) {
      throw new Error(
        'At least one of the following must be provided: dataElementIds, dataElementCodes',
      );
    }

    if (dataElementIds) {
      return { ids: dataElementIds };
    }

    return { codes: dataElementCodes };
  };

  async fetchIndicators(queryInput) {
    const query = this.buildFetchIndicatorsQuery(queryInput);
    return this.getRecords({
      type: INDICATOR,
      ...query,
    });
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
    return this.buildOptionsFromOptionSet(result);
  };

  buildOptionsFromOptionSet = optionSet => {
    const options = {};
    optionSet.options.forEach(({ name, code: optionCode }) => {
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

  /**
   * @param {{ dataElement: string; period: string; orgUnit: string; categoryOptionCombo?: string}} data
   */
  async deleteDataValue({
    dataElement: dataElementCode,
    period,
    orgUnit: organisationUnitCode,
    categoryOptionCombo: categoryOptionComboCode,
  }) {
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
    if (categoryOptionComboCode) {
      const categoryOptionComboId = await this.getIdFromCode(
        CATEGORY_OPTION_COMBO,
        categoryOptionComboCode,
      );
      if (!categoryOptionComboId) {
        throw new Error(`Category option combo ${categoryOptionComboCode} does not exist`);
      }
      query.co = categoryOptionComboId;
    }
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
