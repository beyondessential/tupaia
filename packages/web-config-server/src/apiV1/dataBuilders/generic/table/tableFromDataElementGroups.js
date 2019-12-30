/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import { getSortByKey } from '/utils';
import { getDataElementGroupSets, stripFromStart } from '/apiV1/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { AGGREGATION_TYPES } from '/dhis';

const TOTALS_COLUMN_KEY = '_totalsColumn';

function getResultsForDataElements(allResults, dataElementIds) {
  return allResults.filter(({ dataElement: dataElementId }) =>
    dataElementIds.includes(dataElementId),
  );
}

const sortByCode = getSortByKey('code');
const sortByKey = getSortByKey('key');

class TableFromDataElementGroupsDataBuilder extends DataBuilder {
  constructor(...args) {
    super(...args);
    this.aggregationType = this.entity.isFacility()
      ? AGGREGATION_TYPES.MOST_RECENT
      : AGGREGATION_TYPES.SUM_MOST_RECENT_PER_FACILITY;
  }

  async build() {
    const {
      columnDataElementGroupSets: columnDataElementGroupSetCodes,
      rowDataElementGroupSets: rowDataElementGroupSetCodes,
      stripFromColumnNames,
      stripFromRowCategoryNames,
      shouldShowTotalsColumn,
    } = this.config;

    // Get the columns
    const columns = [];
    let dataElementToColumnKey = {};
    const columnKeyToColumnGroupTotalKey = {};
    const columnDataElementGroupSets = await getDataElementGroupSets(
      this.dhisApi,
      columnDataElementGroupSetCodes,
    );
    Object.entries(columnDataElementGroupSets).forEach(
      ([
        columnDataElementGroupSetCode,
        { dataElementGroups: columnDataElementGroups, dataElementToGroupMapping },
      ]) => {
        const columnGroupTotalKey = `${TOTALS_COLUMN_KEY}_${columnDataElementGroupSetCode}`;
        const columnsForGroup = Object.entries(columnDataElementGroups).map(
          ([id, { name, code }]) => {
            columnKeyToColumnGroupTotalKey[id] = columnGroupTotalKey;
            return { key: id, title: stripFromStart(name, stripFromColumnNames), code };
          },
        );
        const sortedColumnsForGroup = columnsForGroup.sort(sortByCode);
        if (shouldShowTotalsColumn) {
          // Add totals column to the end of the sorted columns
          sortedColumnsForGroup.push({
            key: columnGroupTotalKey,
            title: 'Totals',
          });
        }
        columns.push(...sortedColumnsForGroup);
        dataElementToColumnKey = { ...dataElementToColumnKey, ...dataElementToGroupMapping };
      },
    );

    // Get all results, ready to split into rows and columns
    const rowDataElementGroupSets = await getDataElementGroupSets(
      this.dhisApi,
      rowDataElementGroupSetCodes,
    );
    const allResults = this.isForSpecificEvent()
      ? await this.getEventResults()
      : await this.getDataValueResults(rowDataElementGroupSets);

    // Get the rows and data for each category
    const rows = [];
    const categories = [];
    Object.entries(rowDataElementGroupSets).forEach(
      ([dataElementGroupSetCode, dataElementGroupSet]) => {
        const categoryName = stripFromStart(dataElementGroupSet.name, stripFromRowCategoryNames);
        categories.push({ key: dataElementGroupSetCode, title: categoryName });
        const rowsForCategory = this.getDataForRowCategory(
          dataElementGroupSet,
          allResults,
          columns,
          dataElementToColumnKey,
          columnKeyToColumnGroupTotalKey,
        );
        rows.push(...rowsForCategory);
      },
    );

    const responseObject = {
      columns,
      rows,
    };
    // Only include categories if there is more than one (a single category is pointless)
    if (categories.length > 1) {
      responseObject.categories = categories.sort(sortByKey);
    }
    return responseObject;
  }

  async getEventResults() {
    const { eventId } = this.query;
    const { results } = await this.getEventAnalytics({ eventId });

    return results;
  }

  async getDataValueResults(rowDataElementGroupSets) {
    const dataElementGroupCodes = Object.values(rowDataElementGroupSets).reduce(
      (codesSoFar, { dataElementGroups }) => [
        ...codesSoFar,
        ...Object.values(dataElementGroups).map(({ code }) => code),
      ],
      [],
    );
    const { results } = await this.getDataValueAnalytics({ dataElementGroupCodes });

    return results;
  }

  getDataForRowCategory(
    dataElementGroupSet,
    allResults,
    columns,
    dataElementToColumnKey,
    columnKeyToColumnGroupTotalKey,
  ) {
    const {
      stripFromRowNames,
      shouldShowTotalsRow,
      shouldShowTotalsColumn,
      rowCategories,
    } = this.config;
    const {
      code: dataElementGroupSetCode,
      dataElementGroups: rowDataElementGroups,
    } = dataElementGroupSet;

    const rows = [];

    // Prepare an object to hold the total of each column so sums can be performed during row data gathering
    const columnTotals = {};
    columns.forEach(({ key }) => {
      columnTotals[key] = 0;
    });
    Object.values(rowDataElementGroups).forEach(({ code, name, dataElements }) => {
      const rowData = {
        dataElement: stripFromStart(name, stripFromRowNames),
        categoryId: dataElementGroupSetCode,
        code,
      };
      const dataElementIdsForGroup = dataElements.map(({ id }) => id);
      const dataElementGroupResults = getResultsForDataElements(allResults, dataElementIdsForGroup);
      // eslint-disable-next-line no-loop-func
      dataElementGroupResults.forEach(({ dataElement: dataElementId, value }) => {
        const columnKey = dataElementToColumnKey[dataElementId];
        rowData[columnKey] = value;
        columnTotals[columnKey] += value;
        if (shouldShowTotalsColumn) {
          const columnGroupTotalKey = columnKeyToColumnGroupTotalKey[columnKey];
          rowData[columnGroupTotalKey] = (rowData[columnGroupTotalKey] || 0) + value;
          columnTotals[columnGroupTotalKey] = (columnTotals[columnGroupTotalKey] || 0) + value;
        }
      });
      rows.push(rowData);
    });
    const sortedRows = rows.sort(sortByCode);
    if (
      shouldShowTotalsRow ||
      (rowCategories && rowCategories[dataElementGroupSetCode].shouldShowTotals)
    ) {
      const totalsRow = { dataElement: 'Totals', categoryId: dataElementGroupSetCode };
      Object.entries(columnTotals).forEach(([columnKey, totalForColumn]) => {
        totalsRow[columnKey] = totalForColumn;
      });
      sortedRows.push(totalsRow); // Add totals row to the end
    }
    return sortedRows;
  }
}

export const tableFromDataElementGroups = async ({ dataBuilderConfig, query, entity }, dhisApi) => {
  const builder = new TableFromDataElementGroupsDataBuilder(
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  const responseObject = await builder.build();

  return responseObject;
};
