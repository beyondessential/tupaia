import { isNullish } from '@tupaia/tsutils';
import { NotImplementedError, respond } from '@tupaia/utils';
import { processColumns, processColumnSelector, processColumnSelectorKeys } from '@tupaia/database';

import { CRUDHandler } from '../CRUDHandler';
import { generateLinkHeader, getQueryOptionsForColumns, parsePageSizeQueryParam } from './helpers';

export const DEFAULT_PAGE_SIZE = 100;

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
  /** @type {boolean} */
  permissionsFilteredInternally;

  async handleRequest() {
    const { headers = {}, body } = await this.buildResponse();
    Object.entries(headers).forEach(([key, value]) => this.res.set(key, value));
    respond(this.res, body);
  }

  /**
   * @returns {{limit: number|null, page: number|undefined}}
   */
  getPaginationParameters() {
    const { pageSize = DEFAULT_PAGE_SIZE, page } = this.req.query;
    const limit = parsePageSizeQueryParam(pageSize);

    return isNullish(limit)
      ? { limit } // Pagination doesn’t make sense when LIMIT ALL
      : { limit, page: Number.parseInt(page, 10) };
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
    const columnNames = columns.flatMap(Object.keys); // [{ a: 'e' }, { b: 'f' }] => ['a', 'b']
    const { sort, multiJoin } = getQueryOptionsForColumns(
      columnNames,
      this.recordType,
      this.customJoinConditions,
      this.defaultJoinType,
    );

    const { limit, page } = this.getPaginationParameters();

    const dbQueryOptions = { multiJoin, columns, sort, rawSort, distinct, limit };

    if (Number.isInteger(limit) && Number.isInteger(page)) {
      dbQueryOptions.offset = limit * page;
    }

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

  /**
   * @abstract
   */
  getPermissionsFilter() {
    throw new NotImplementedError(
      `'getPermissionsFilter' must be implemented by all internally filtered GETHandlers`,
    );
  }

  /**
   * @abstract
   */
  getPermissionsViaParentFilter() {
    throw new NotImplementedError(
      `Cannot GET via parent record without 'getPermissionsViaParentFilter' implementation`,
    );
  }

  async applyPermissionsFilter(criteria, options) {
    return this.parentRecordId
      ? this.getPermissionsViaParentFilter(criteria, options)
      : this.getPermissionsFilter(criteria, options);
  }

  async buildResponse() {
    let options = await this.getDbQueryOptions();

    // handle request for a single record
    const { recordId } = this;
    if (recordId) {
      const record = await this.findSingleRecord(recordId, options);
      return { body: record };
    }

    // handle request for multiple records, including pagination headers
    let criteria = this.getDbQueryCriteria();
    if (this.permissionsFilteredInternally) {
      ({ dbConditions: criteria, dbOptions: options } = await this.applyPermissionsFilter(
        criteria,
        options,
      ));
    }

    const [pageOfRecords, totalRecordCount] = await Promise.all([
      this.findRecords(criteria, options),
      this.countRecords(criteria, options),
    ]);

    return {
      headers: this.#buildHeaders(totalRecordCount),
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

  /** @param {number} totalRecordCount */
  #buildHeaders(totalRecordCount) {
    const headers = {
      'Access-Control-Expose-Headers': 'X-Total-Count', // to get around CORS
      'X-Total-Count': totalRecordCount,
    };

    const { limit, page } = this.getPaginationParameters();
    if (Number.isInteger(limit) && Number.isInteger(page)) {
      const lastPage = Number.isFinite(totalRecordCount)
        ? Math.ceil(totalRecordCount / limit)
        : null;
      headers['Access-Control-Expose-Headers'] = 'Link, X-Total-Count';
      headers.Link = generateLinkHeader(this.resource, page, lastPage, this.req.query);
    }

    return headers;
  }
}
