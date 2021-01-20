/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import formatLinkHeader from 'format-link-header';
import { TYPES, JOIN_TYPES, DatabaseType } from '@tupaia/database';
import { respond, DatabaseError, ValidationError } from '@tupaia/utils';
import {
  findAnswersInSurveyResponse,
  findEntitiesInCountry,
  findFormattedDisasters,
  findSurveyScreenComponentsInSurvey,
  findSurveysInCountry,
  findDataElementsInDataGroup,
  findOrCountJoinChildren,
} from '../dataAccessors';
import { getApiUrl, resourceToRecordType } from '../utilities';

const GETTABLE_TYPES = [
  TYPES.ANSWER,
  TYPES.FACILITY,
  TYPES.ENTITY,
  TYPES.COUNTRY,
  TYPES.GEOGRAPHICAL_AREA,
  TYPES.SURVEY,
  TYPES.SURVEY_RESPONSE,
  TYPES.USER_ACCOUNT,
  TYPES.QUESTION,
  TYPES.SURVEY_SCREEN_COMPONENT,
  TYPES.USER_ENTITY_PERMISSION,
  TYPES.PERMISSION_GROUP,
  TYPES.SURVEY_GROUP,
  TYPES.FEED_ITEM,
  TYPES.OPTION_SET,
  TYPES.OPTION,
  TYPES.PROJECT,
  TYPES.DISASTER,
  TYPES.DATA_SOURCE,
  TYPES.COMMENT,
  TYPES.ACCESS_REQUEST,
  TYPES.DASHBOARD_REPORT,
  TYPES.MAP_OVERLAY,
  TYPES.DASHBOARD_GROUP,
];

const createMultiResourceKey = (...recordTypes) => recordTypes.filter(x => x).join('/');
const CUSTOM_FINDERS = {
  [TYPES.DISASTER]: (models, parentRecordId, criteria) => findFormattedDisasters(models, criteria),
  [createMultiResourceKey(
    TYPES.SURVEY,
    TYPES.SURVEY_SCREEN_COMPONENT,
  )]: findSurveyScreenComponentsInSurvey,
  [TYPES.SURVEY_SCREEN_COMPONENT]: findSurveyScreenComponentsInSurvey,
  [createMultiResourceKey(TYPES.SURVEY_RESPONSE, TYPES.ANSWER)]: findAnswersInSurveyResponse,
  [createMultiResourceKey(TYPES.COUNTRY, TYPES.SURVEY)]: findSurveysInCountry,
  [createMultiResourceKey(TYPES.COUNTRY, TYPES.ENTITY)]: findEntitiesInCountry,
  [createMultiResourceKey(TYPES.DATA_SOURCE, TYPES.DATA_SOURCE)]: findDataElementsInDataGroup,
};
const CUSTOM_FOREIGN_KEYS = {
  [createMultiResourceKey(TYPES.USER_ENTITY_PERMISSION, TYPES.USER_ACCOUNT)]: 'user_id',
};
const getForeignKeyColumn = (recordType, parentRecordType) => {
  const key = createMultiResourceKey(recordType, parentRecordType);
  return CUSTOM_FOREIGN_KEYS[key] || `${parentRecordType}_id`;
};
const PARENT_RECORD_FINDERS = {
  [`${TYPES.SURVEY_RESPONSE}/${TYPES.COMMENT}`]: findOrCountJoinChildren,
};

const MAX_RECORDS_PER_PAGE = 100;

/**
 * Responds to arbitrary GET requests to endpoints that relate to record types listed in the
 * GETTABLE_TYPES constant.
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
export async function getRecords(req, res) {
  const { database, models, params, query } = req;
  const { parentResource, parentRecordId, resource, recordId } = params;
  const shouldReturnSingleRecord = !!recordId;
  const recordType = resourceToRecordType(resource);
  const parentRecordType = resourceToRecordType(parentResource);
  if (!GETTABLE_TYPES.includes(recordType)) {
    throw new ValidationError(`${recordType} is not a valid GET endpoint`);
  }
  try {
    const {
      pageSize: limit = MAX_RECORDS_PER_PAGE,
      page,
      columns: columnsString,
      filter: filterString,
      sort: sortString,
      distinct = false,
    } = query;

    // Set up the finder for this record type (sometimes custom, mostly generic)
    const findOrCountRecords = (options, findOrCount = 'find') => {
      const filter = filterString ? JSON.parse(filterString) : {};
      const customFinder = CUSTOM_FINDERS[createMultiResourceKey(parentRecordType, recordType)];
      let criteria = customFinder ? filter : processColumnSelectorKeys(filter, recordType);
      // If a specific record was requested through the route, just find that
      if (shouldReturnSingleRecord) {
        criteria = { [`${recordType}.id`]: recordId };
      }
      if (customFinder) {
        return customFinder(models, parentRecordId, criteria, options, findOrCount);
      }
      if (parentRecordType) {
        const recordAccessor = PARENT_RECORD_FINDERS[`${parentRecordType}/${recordType}`];
        if (recordAccessor) {
          return recordAccessor(
            models,
            findOrCount,
            recordType,
            parentRecordType,
            parentRecordId,
            criteria,
            options,
          );
        }

        return database[findOrCount](
          recordType,
          { ...criteria, [getForeignKeyColumn(recordType, parentRecordType)]: parentRecordId },
          options,
        );
      }
      return database[findOrCount](recordType, criteria, options);
    };

    // First find out how many records there are and generate the pagination headers
    const unprocessedColumns = columnsString && JSON.parse(columnsString);
    let { sort, multiJoin } = getQueryOptionsForColumns(unprocessedColumns, recordType);
    if (!shouldReturnSingleRecord) {
      const numberOfRecords = await findOrCountRecords({ multiJoin }, 'count');
      const lastPage = Math.ceil(numberOfRecords / limit);
      const linkHeader = generateLinkHeader(resource, page, lastPage, query);
      res.set('Link', linkHeader);
      res.set('Access-Control-Expose-Headers', 'Link'); // To get around CORS
    }

    // Add columns, sort, limit and offset to options and find the records themselves
    const columns = unprocessedColumns && processColumns(unprocessedColumns, recordType);
    const offset = limit * page;
    // Add any user requested sorting to the start of the sort clause
    if (sortString) {
      const sortKeys = JSON.parse(sortString);
      const fullyQualifiedSortKeys = sortKeys.map(sortKey =>
        processColumnSelector(sortKey, recordType),
      );
      // if 'distinct', we can't order by any columns that aren't included in the distinct selection
      if (distinct) {
        sort = fullyQualifiedSortKeys;
      } else {
        sort.unshift(...fullyQualifiedSortKeys);
      }
    }
    const options = { multiJoin, columns, limit, offset, sort, distinct };
    const records = await findOrCountRecords(options);
    // Respond only with the data in each record, stripping out metadata from DatabaseType instances
    const getRecordData = async record =>
      record instanceof DatabaseType ? record.getData() : record;
    const responseData = await (shouldReturnSingleRecord
      ? getRecordData(records[0])
      : Promise.all(records.map(getRecordData)));

    // Respond with the records
    respond(res, responseData);
  } catch (error) {
    throw new DatabaseError(`finding ${resource} records`, error);
  }
}

function generateLinkHeader(resource, pageString, lastPage, originalQueryParameters) {
  const currentPage = parseInt(pageString, 10);

  const getUrlForPage = page => getApiUrl(resource, { ...originalQueryParameters, page });

  // We can always send through first and last, so start with that in the link header
  const linkHeader = {
    first: {
      url: getUrlForPage(0),
      rel: 'first',
    },
    last: {
      url: getUrlForPage(lastPage),
      rel: 'last',
    },
  };

  // If not the first page, generate a 'prev' link to the page before
  if (currentPage > 0) {
    linkHeader.prev = {
      url: getUrlForPage(currentPage - 1),
      rel: 'prev',
    };
  }

  // If not the last page, generate a 'next' link to the next page
  if (currentPage < lastPage) {
    linkHeader.next = {
      url: getUrlForPage(currentPage + 1),
      rel: 'next',
    };
  }

  return formatLinkHeader(linkHeader);
}

function processColumns(unprocessedColumns, recordType) {
  return unprocessedColumns.map(column => ({
    [column]: processColumnSelector(column, recordType),
  }));
}

function getQueryOptionsForColumns(columns, baseRecordType) {
  const sort = [`${baseRecordType}.id`];
  if (!columns) {
    return { sort };
  }
  if (columns.some(c => c.startsWith('_'))) {
    throw new ValidationError(
      'No columns start with "_", and conjunction operators are reserved for internal use only',
    );
  }
  const columnsNeedingJoin = columns.filter(column => column.includes('.'));
  const multiJoin = [];
  const recordTypesJoined = [];
  for (let i = 0; i < columnsNeedingJoin.length; i++) {
    // Split strings into the record type to join with and the column to select, e.g. if the column
    // is 'survey.name', split into 'survey' and 'name'
    const resourceName = columnsNeedingJoin[i].split('.')[0];
    const recordType = resourceToRecordType(resourceName);

    if (recordType !== baseRecordType && !recordTypesJoined.includes(recordType)) {
      multiJoin.push({
        joinType: JOIN_TYPES.LEFT_OUTER,
        joinWith: recordType,
        joinCondition: [`${recordType}.id`, `${resourceName}_id`],
      });
      recordTypesJoined.push(recordType);
    }
  }
  // Ensure every join table is added to the sort, so that queries are predictable during pagination
  sort.push(...recordTypesJoined.map(recordType => `${recordType}.id`));
  return { multiJoin, sort };
}

// Make sure all column keys have the table specified to avoid ambiguous column errors,
// and also transform any resource names into database record types
const processColumnSelectorKeys = (object, recordType) => {
  const processedObject = {};
  Object.entries(object).forEach(([columnSelector, value]) => {
    processedObject[processColumnSelector(columnSelector, recordType)] = value;
  });
  return processedObject;
};

const processColumnSelector = (unprocessedColumnSelector, baseRecordType) => {
  if (unprocessedColumnSelector.includes('.')) {
    const [recordType, column] = unprocessedColumnSelector.split('.');
    return `${resourceToRecordType(recordType)}.${column}`;
  }
  return `${baseRecordType}.${unprocessedColumnSelector}`;
};
