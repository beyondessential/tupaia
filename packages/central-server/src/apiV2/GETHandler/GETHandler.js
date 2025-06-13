import { respond } from '@tupaia/utils';
import winston from '../../log';
import { CRUDHandler } from '../CRUDHandler';
import {
  generateLinkHeader,
  getQueryOptionsForColumns,
  processColumns,
  processColumnSelector,
  processColumnSelectorKeys,
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
 *     https://api.tupaia.org/v2/surveyResponses/5a5d1c66ae07fb3fb025c3a3
 *       Get a specific survey response
 *     https://api.tupaia.org/v2/surveyResponses/5a5d1c66ae07fb3fb025c3a3/answers
 *       Get the answers of a specific survey response
 *     https://api.tupaia.org/v2/answers?pageSize=100&page=3&filter={"survey_response_id":"5a5d1c66ae07fb3fb025c3a3"}
 *       Get the fourth page of 100 answers for a given survey response
 */
export class GETHandler extends CRUDHandler {
  async handleRequest() {
    const { headers = {}, body } = await this.buildResponse();
    Object.entries(headers).forEach(([key, value]) => this.res.set(key, value));
    respond(this.res, body);
  }

  getPaginationParameters() {
    const { pageSize: limit = MAX_RECORDS_PER_PAGE, page } = this.req.query;
    return { limit, page };
  }

  async getProcessedColumns() {
    const { columns: columnsString } = this.req.query;

    if (!columnsString) {
      // no columns specifically requested, use all fields on the model
      const fields = await this.resourceModel.fetchFieldNames();
      return processColumns(this.models, fields, this.recordType);
    }

    const unprocessedColumns = columnsString && JSON.parse(columnsString);
    return processColumns(this.models, unprocessedColumns, this.recordType);
  }

  async getDbQueryOptions() {
    const { sort: sortString, rawSort, distinct = false } = this.req.query;

    // set up db query options
    const columns = await this.getProcessedColumns();
    const columnNames = columns.map(c => Object.keys(c)[0]); // [{ a: 'e' }, { b: 'f' }] => ['a', 'b']
    const { sort, multiJoin } = getQueryOptionsForColumns(
      columnNames,
      this.recordType,
      this.customJoinConditions,
      this.defaultJoinType,
    );

    const { limit, page } = this.getPaginationParameters();
    const offset = limit * page;

    const dbQueryOptions = { multiJoin, columns, sort, rawSort, distinct, limit, offset };

    // add any user requested sorting to the start of the sort clause
    if (sortString) {
      const sortKeys = JSON.parse(sortString);
      const processedSortKeys = sortKeys.map(sortKey =>
        processColumnSelector(this.models, sortKey, this.recordType),
      );
      // if 'distinct', we can't order by any columns that aren't included in the distinct selection
      if (distinct) {
        dbQueryOptions.sort = processedSortKeys;
      } else {
        dbQueryOptions.sort.unshift(...processedSortKeys);
      }
    }

    return dbQueryOptions;
  }

  getDbQueryCriteria() {
    const { filter: filterString } = this.req.query;
    const filter = filterString ? JSON.parse(filterString) : {};
    return processColumnSelectorKeys(this.models, filter, this.recordType);
  }

  getPermissionsFilter() {
    throw new Error(
      `'getPermissionsFilter' must be implemented by all internally filtered GETHandlers`,
    );
  }

  getPermissionsViaParentFilter() {
    throw new Error(
      `Cannot GET via parent record without 'getPermissionsViaParentFilter' implementation`,
    );
  }

  async applyPermissionsFilter(criteria, options) {
    return this.parentRecordId
      ? this.getPermissionsViaParentFilter(criteria, options)
      : this.getPermissionsFilter(criteria, options);
  }

  async buildResponse() {
    winston.debug(`[GETHandler#buildResponse]`);
    let options = await this.getDbQueryOptions();
    winston.debug(`[GETHandler#buildResponse] options: ${JSON.stringify(options, null, 2)}`);

    // handle request for a single record
    const { recordId } = this;
    if (recordId) {
      const record = await this.findSingleRecord(recordId, options);
      return { body: record };
    }

    // handle request for multiple records, including pagination headers
    let criteria = this.getDbQueryCriteria();
    winston.debug(`[GETHandler#buildResponse] criteria: ${JSON.stringify(criteria, null, 2)}`);
    if (this.permissionsFilteredInternally) {
      ({ dbConditions: criteria, dbOptions: options } = await this.applyPermissionsFilter(
        criteria,
        options,
      ));
    }

    const [pageOfRecords, totalNumberOfRecords] = await Promise.all([
      this.findRecords(criteria, options),
      this.countRecords(criteria, options),
    ]);
    winston.debug(`[GETHandler#buildResponse] ${totalNumberOfRecords} records. `);

    const { limit, page } = this.getPaginationParameters();
    const lastPage = Math.ceil(totalNumberOfRecords / limit);
    const linkHeader = generateLinkHeader(this.resource, page, lastPage, this.req.query);
    winston.debug(
      `[GETHandler#buildResponse] Returning page of ${pageOfRecords.length}: ${JSON.stringify(pageOfRecords, null, 2)}`,
    );
    return {
      headers: {
        Link: linkHeader,
        'Access-Control-Expose-Headers': 'Link, X-Total-Count', // to get around CORS
        'X-Total-Count': totalNumberOfRecords,
      },
      body: pageOfRecords,
    };
  }

  async countRecords(criteria, { multiJoin }) {
    const options = { multiJoin }; // only the join option is required for count
    return this.database.countFast(this.recordType, criteria, options);
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
