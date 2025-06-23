import formatLinkHeader from 'format-link-header';
import { ValidationError } from '@tupaia/utils';
import { getApiUrl, resourceToRecordType } from '../../utilities';
import winston from '../../log';
import { isNullish } from '@tupaia/tsutils';
import { DEFAULT_PAGE_SIZE } from './GETHandler';

export const parsePageSizeQueryParam = pageSize => {
  if (Number.isInteger(pageSize) && pageSize > 0) return pageSize;
  if (pageSize === 'ALL' || isNullish(pageSize)) return null;
  winston.warn(
    `Received invalid pageSize query parameter: ${pageSize}. If provided, should be a positive integer, 'ALL' or null. Using default limit of ${DEFAULT_PAGE_SIZE}.`,
  );
  return DEFAULT_PAGE_SIZE;
};

/**
 * @param {string} resource
 * @param {*|number|string} pageString
 * @param {number|null} lastPage
 * @param {object} originalQueryParameters
 */
export const generateLinkHeader = (resource, pageString, lastPage, originalQueryParameters) => {
  const debugLog = ['dashboard', 'dashboard_item', 'dashboard_relation'].includes(resource)
    ? winston.debug
    : winston.silly;

  debugLog(
    `[generateLinkHeader] ${JSON.stringify(
      {
        resource,
        pageString,
        lastPage,
        originalQueryParameters,
      },
      null,
      2,
    )}`,
  );

  const currentPage = Number.parseInt(pageString, 10);
  debugLog(`[generateLinkHeader] currentPage: ${currentPage}`);

  const getUrlForPage = page => getApiUrl(resource, { ...originalQueryParameters, page });

  // We can always send through first, so start with that in the link header
  const linkHeader = {
    first: {
      url: getUrlForPage(0),
      rel: 'first',
    },
  };

  const lastPageIsKnown = Number.isInteger(lastPage) && lastPage > 0 && Number.isFinite(lastPage);
  if (lastPageIsKnown) {
    linkHeader.last = {
      url: getUrlForPage(lastPage),
      rel: 'last',
    };
  }

  // If not the first page, generate a 'prev' link to the page before
  if (currentPage > 0) {
    linkHeader.prev = {
      url: getUrlForPage(currentPage - 1),
      rel: 'prev',
    };
  }

  // If not the last page, generate a 'next' link to the next page
  // If last page is unknown, include it anyway
  if (currentPage < lastPage || !lastPageIsKnown) {
    linkHeader.next = {
      url: getUrlForPage(currentPage + 1),
      rel: 'next',
    };
  }

  debugLog(`[generateLinkHeader] formatting linkHeader: ${JSON.stringify(linkHeader, null, 2)}`);

  const rv = formatLinkHeader(linkHeader);
  debugLog(`[generateLinkHeader] formatted: ${rv}`);

  return rv;
};

export const fullyQualifyColumnSelector = (models, unprocessedColumnSelector, baseRecordType) => {
  const [resource, column] = unprocessedColumnSelector.includes('.')
    ? unprocessedColumnSelector.split('.')
    : [baseRecordType, unprocessedColumnSelector];
  const recordType = resourceToRecordType(resource);
  return `${recordType}.${column}`;
};

// Make sure all column keys have the table specified to avoid ambiguous column errors,
// and also transform any resource names into database record types
export const processColumnSelectorKeys = (models, object, recordType) => {
  const processedObject = {};
  Object.entries(object).forEach(([columnSelector, value]) => {
    processedObject[processColumnSelector(models, columnSelector, recordType)] = value;
  });
  return processedObject;
};

export const processColumnSelector = (models, unprocessedColumnSelector, baseRecordType) => {
  const fullyQualifiedSelector = fullyQualifyColumnSelector(
    models,
    unprocessedColumnSelector,
    baseRecordType,
  );
  const [recordType, column] = fullyQualifiedSelector.split('.');
  const model = models.getModelForDatabaseRecord(recordType);
  const customSelector = model?.customColumnSelectors?.[column];
  return customSelector ? customSelector(fullyQualifiedSelector) : fullyQualifiedSelector;
};

export const processColumns = (models, unprocessedColumns, recordType) => {
  return unprocessedColumns.map(column => ({
    [column]: processColumnSelector(models, column, recordType),
  }));
};

const getForeignKeyColumnName = foreignTable => {
  const exceptions = {
    user_account: 'user_id',
    survey_screen: 'screen_id',
  };
  return exceptions[foreignTable] || `${foreignTable}_id`;
};

const constructJoinCondition = (recordType, baseRecordType, customJoinConditions, joinType) => {
  const join = customJoinConditions[recordType];
  const joinCondition = join
    ? [join.farTableKey, join.nearTableKey]
    : [`${recordType}.id`, `${baseRecordType}.${getForeignKeyColumnName(recordType)}`];
  const parentJoin = {
    joinWith: recordType,
    joinCondition,
    joinType,
  };
  if (join?.through) {
    if (!('nearTableKey' in join) || !('farTableKey' in join)) {
      throw new ValidationError(`Incorrect format for customJoinConditions: ${recordType}`);
    }
    const nearTable = join.nearTableKey.split('.');
    if (nearTable[0] !== join.through) {
      throw new ValidationError(
        'nearTableKey must refer to a column on the table you wish to join through',
      );
    }
    const childJoin = constructJoinCondition(
      join.through,
      baseRecordType,
      customJoinConditions,
      joinType,
    );
    return [...childJoin, parentJoin];
  }
  return [parentJoin];
};

export const getQueryOptionsForColumns = (
  columnNames,
  baseRecordType,
  customJoinConditions = {},
  joinType = null,
) => {
  if (columnNames.some(c => c.startsWith('_'))) {
    throw new ValidationError(
      'No columns start with "_", and conjunction operators are reserved for internal use only',
    );
  }
  const multiJoin = [];
  const recordTypesInQuery = new Set([baseRecordType]);
  columnNames
    .filter(c => c.includes('.'))
    .forEach(columnName => {
      // Split strings into the record type to join with and the column to select, e.g. if the column
      // is 'survey.name', split into 'survey' and 'name'
      const resource = columnName.split('.')[0];
      const recordType = resourceToRecordType(resource);
      if (!recordTypesInQuery.has(recordType)) {
        const joinConditions = constructJoinCondition(
          recordType,
          baseRecordType,
          customJoinConditions,
          joinType,
        );

        joinConditions.forEach(j => {
          if (!recordTypesInQuery.has(j.joinWith)) multiJoin.push(j);
          recordTypesInQuery.add(j.joinWith);
        });
      }
    });
  // Ensure every join table is added to the sort, so that queries are predictable during pagination
  const sort = [...recordTypesInQuery].map(recordType => `${recordType}.id`);
  return { multiJoin, sort };
};
