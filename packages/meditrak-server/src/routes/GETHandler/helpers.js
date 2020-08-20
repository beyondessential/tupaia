/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import formatLinkHeader from 'format-link-header';
import { JOIN_TYPES } from '@tupaia/database';
import { ValidationError } from '@tupaia/utils';
import { getApiUrl, resourceToRecordType } from '../../utilities';

// if the endpoint is /survey/5a5d1c66ae07fb3fb025c3a3/answer, the resource is 'survey'
export const extractResourceFromEndpoint = endpoint => endpoint.split('/')[1];

export const generateLinkHeader = (resource, pageString, lastPage, originalQueryParameters) => {
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
};

export const processColumnSelector = (unprocessedColumnSelector, baseRecordType) => {
  if (unprocessedColumnSelector.includes('.')) {
    const [recordType, column] = unprocessedColumnSelector.split('.');
    return `${resourceToRecordType(recordType)}.${column}`;
  }
  return `${baseRecordType}.${unprocessedColumnSelector}`;
};

// Make sure all column keys have the table specified to avoid ambiguous column errors,
// and also transform any resource names into database record types
export const processColumnSelectorKeys = (object, recordType) => {
  const processedObject = {};
  Object.entries(object).forEach(([columnSelector, value]) => {
    processedObject[processColumnSelector(columnSelector, recordType)] = value;
  });
  return processedObject;
};

export const processColumns = (unprocessedColumns, recordType) => {
  return unprocessedColumns.map(column => ({
    [column]: processColumnSelector(column, recordType),
  }));
};

export const getQueryOptionsForColumns = (columns, baseRecordType) => {
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
};
