/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { RouteHandler } from '../RouteHandler';
import { resourceToRecordType } from '../../utilities';
import {
  extractResourceFromEndpoint,
  getQueryOptionsForColumns,
  processColumns,
  processColumnSelector,
  processColumnSelectorKeys,
  generateLinkHeader,
} from './helpers';

const MAX_RECORDS_PER_PAGE = 100;

/**
 * Responds to GET requests for a resource.
 * The endpoints should take the camel case form of the record, and be the plural form, unless you
 * are requesting a specific record by its id.
 * These endpoints also support pagination using 'pageSize' and 'page' query parameters, sorting
 * using the 'sort' query parameter, and filtering using any other query parameter.
 * As with most endpoints, you must also pass in a Bearer auth header with an access token
 * Examples:
 *     https://api.tupaia.org/v2/countries?sort=["name DESC"]
 *       Get all countries, sorted alphabetically by name in reverse order
 *     https://api.tupaia.org/v2/surveyResponse/5a5d1c66ae07fb3fb025c3a3
 *       Get a specific survey response
 *     https://api.tupaia.org/v2/surveyResponse/5a5d1c66ae07fb3fb025c3a3/answers
 *       Get the answers of a specific survey response
 *     https://api.tupaia.org/v2/answers?pageSize=100&page=3&filter={"survey_response_id":"5a5d1c66ae07fb3fb025c3a3"}
 *       Get the fourth page of 100 answers for a given survey response
 */
export class GETHandler extends RouteHandler {
  constructor(req, res) {
    super(req, res);
    const { database, query, endpoint } = req;
    this.database = database;
    this.query = query;
    this.resource = extractResourceFromEndpoint(endpoint);
    this.recordType = resourceToRecordType(this.resource);
  }

  async handleRequest() {
    await this.checkPermissionsGate(); // run base permissions check for this endpoint
    const { headers = {}, body } = await this.buildResponse();
    Object.entries(headers).forEach(([key, value]) => this.res.set(key, value));
    respond(this.res, body);
  }

  getPaginationParameters() {
    const { pageSize: limit = MAX_RECORDS_PER_PAGE, page } = this.req.query;
    return { limit, page };
  }

  getDbQueryOptions() {
    const { columns: columnsString, sort: sortString, distinct = false } = this.req.query;

    // set up db query options
    const unprocessedColumns = columnsString && JSON.parse(columnsString);
    const { sort, multiJoin } = getQueryOptionsForColumns(unprocessedColumns, this.recordType);
    const columns = unprocessedColumns && processColumns(unprocessedColumns, this.recordType);

    const { limit, page } = this.getPaginationParameters();
    const offset = limit * page;

    const dbQueryOptions = { multiJoin, columns, sort, distinct, limit, offset };

    // add any user requested sorting to the start of the sort clause
    if (sortString) {
      const sortKeys = JSON.parse(sortString);
      const fullyQualifiedSortKeys = sortKeys.map(sortKey =>
        processColumnSelector(sortKey, this.recordType),
      );
      // if 'distinct', we can't order by any columns that aren't included in the distinct selection
      if (distinct) {
        dbQueryOptions.sort = fullyQualifiedSortKeys;
      } else {
        dbQueryOptions.sort.unshift(...fullyQualifiedSortKeys);
      }
    }

    return dbQueryOptions;
  }

  getRecordId() {
    return this.req.params.recordId;
  }

  getDbQueryCriteria() {
    const { filter: filterString } = this.req.query;
    const filter = filterString ? JSON.parse(filterString) : {};
    return processColumnSelectorKeys(filter, this.recordType);
  }

  async buildResponse() {
    const options = this.getDbQueryOptions();

    // handle request for a single record
    const recordId = this.getRecordId();
    if (recordId) {
      const record = await this.findSingleRecord(recordId, options);
      return { body: record };
    }

    // handle request for multiple records, including pagination headers
    const criteria = this.getDbQueryCriteria();
    const pageOfRecords = await this.findRecords(criteria, options);
    const totalNumberOfRecords = await this.countRecords(criteria, options);
    const { limit, page } = this.getPaginationParameters();
    const lastPage = Math.ceil(totalNumberOfRecords / limit);
    const linkHeader = generateLinkHeader(this.resource, page, lastPage, this.req.query);
    return {
      headers: {
        Link: linkHeader,
        'Access-Control-Expose-Headers': 'Link', // To get around CORS
      },
      body: pageOfRecords,
    };
  }

  async countRecords(criteria, { multiJoin }) {
    const options = { multiJoin }; // only the join option is required for count
    return this.database.count(this.recordType, criteria, options);
  }

  async findRecords(criteria, options) {
    return this.database.find(this.recordType, criteria, options);
  }

  async findSingleRecord(recordId, options) {
    const [record] = await this.database.find(
      this.recordType,
      { [`${this.recordType}.id`]: recordId },
      options,
    );
    return record;
  }
}
