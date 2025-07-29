import { flatten, keyBy } from 'es-toolkit/compat';

import { getSortByKey, reduceToDictionary, reduceToSet } from '@tupaia/utils';

import { TableConfig } from './TableConfig';
import { TotalCalculator } from './TotalCalculator';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

import {
  buildBaseRowsForOrgUnit,
  buildCategoryData,
  buildColumnSummary,
  buildRowSummary,
  getValuesByCell,
} from './helpers';

import {
  ORG_UNIT_COL_KEY,
  ORG_UNIT_COLUMNS_KEYS_SET,
  ORG_UNIT_WITH_TYPE_COL_KEY,
} from '/apiV1/dataBuilders/constants';

const getColumnKey = columnIndex => `Col${parseInt(columnIndex, 10) + 1}`;

const EXCLUDED_VALUE = 'excludedValue';

export class TableOfDataValuesBuilder extends DataBuilder {
  async build() {
    const { results, period } = await this.fetchAnalyticsAndMetadata();
    this.results = results;
    this.tableConfig = new TableConfig(this.models, this.config, this.results);
    this.valuesByCell = await this.buildValuesByCell();
    this.totalCalculator = new TotalCalculator(this.tableConfig, this.valuesByCell);
    this.rowsToDescriptions = {};

    const columns = this.columns || (await this.buildColumns());
    const rows = await this.buildRows(columns);
    const data = { columns, rows, period };

    return this.buildFromExtraConfig(data, columns);
  }

  /**
   * @param {{ rows, columns }} data
   */
  async buildFromExtraConfig(data, columns) {
    let newData = { ...data };
    const { rows } = newData;
    if (this.tableConfig.hasRowCategories()) {
      const categories = await this.buildRowCategories();

      if (this.config.categoryAggregator) {
        const categoryData = buildCategoryData({
          rows: Object.values(rows),
          categoryAggregatorConfig: this.config.categoryAggregator,
          columns,
        });
        newData.rows = [...rows, ...categories.map(c => ({ ...c, ...categoryData[c.category] }))];
      } else {
        newData.rows = [...rows, ...categories];
      }
    }

    if (ORG_UNIT_COLUMNS_KEYS_SET.includes(this.tableConfig.columnType)) {
      const dataColumns = await this.replaceOrgUnitCodesWithNames(data.columns);
      newData.columns = dataColumns.sort(getSortByKey('title'));
    }

    if (EXCLUDED_VALUE in this.config) {
      const excludedValue = this.config[EXCLUDED_VALUE];
      newData.rows.forEach(row => {
        Object.entries(row).forEach(([key, value]) => {
          // eslint-disable-next-line no-param-reassign
          if (value === excludedValue) delete row[key];
        });
      });
    }

    if (this.config.columnSummary) {
      newData = buildColumnSummary(newData, this.config.columnSummary);
    }

    if (this.config.rowSummary) {
      const skipRowForColumnSummary = !!this.config.columnSummary;
      newData = buildRowSummary(newData, { ...this.config.rowSummary, skipRowForColumnSummary });
    }
    return newData;
  }

  async fetchAnalyticsAndMetadata() {
    const dataElementCodes = this.buildDataElementCodes();
    // There are some valid configs which don't fetch any data
    if (dataElementCodes.length === 0) return { results: [] };

    const { results, period } = await this.fetchAnalytics(dataElementCodes);
    const dataElements = await this.fetchDataElements(dataElementCodes);
    const dataElementByCode = keyBy(dataElements, 'code');
    const resultsWithMetadata = results.map(result => ({
      ...result,
      metadata: dataElementByCode[result.dataElement] || {},
    }));
    return { results: resultsWithMetadata, period };
  }

  buildDataElementCodes() {
    return [...new Set(flatten(this.config.cells))].filter(
      cell => !TotalCalculator.isTotalKey(cell),
    );
  }

  buildValuesByCell() {
    return getValuesByCell(this.tableConfig, this.results);
  }

  async buildRows() {
    const baseRows = await this.buildBaseRows();
    return baseRows.map((baseRow, rowIndex) => ({
      ...baseRow,
      ...this.buildRowValues(rowIndex),
    }));
  }

  /**
   * @returns {{ dataElement: string, categoryId: (string:undefined) }}
   */
  async buildBaseRows() {
    // Build orgUnit base rows
    if (ORG_UNIT_COLUMNS_KEYS_SET.includes(this.config.columns)) {
      return buildBaseRowsForOrgUnit(this.tableConfig.rows, undefined, 0, this.config);
    }

    if (this.tableConfig.hasRowCategories()) {
      if (this.tableConfig.hasRowDescriptions()) await this.buildRowDescriptions();
      if (this.tableConfig.hasRowDataElements()) {
        const rowDataElementCodes = flatten(
          this.tableConfig.rows.map(({ rows }) => rows.map(row => row.code)),
        );

        const { results } = await this.fetchAnalytics(rowDataElementCodes, {
          entityAggregation: {
            dataSourceEntityType: this.config.rowDataSourceEntityType,
          },
        });
        const rowsWithData = results.map(result => result.dataElement);
        this.tableConfig.rows = this.tableConfig.rows.map(({ rows, category }) => {
          if (this.tableConfig.hasRowDescriptions()) {
            rows
              .filter(row => rowsWithData.includes(row.code))
              .forEach(row => {
                this.rowsToDescriptions[row.name] =
                  this.rowDescriptionResults[row.descriptionDataElement];
              });
          }

          const rowsFromData = rows.filter(row => rowsWithData.includes(row.code)).map(r => r.name);

          return { rows: rowsFromData, category };
        });
      }

      return flatten(
        this.tableConfig.rows.map(({ category: categoryId, rows }) => {
          return rows.map(dataElement => {
            if (dataElement.category) {
              return {
                category: dataElement.category,
                categoryId,
                rows: dataElement.rows || rows,
              };
            }

            const rowData = {
              dataElement: dataElement.hasOwnProperty('name') ? dataElement.name : dataElement,
              categoryId,
            };
            const rowInfo = this.rowsToDescriptions[rowData.dataElement];
            if (rowInfo) return { ...rowData, rowInfo };

            return rowData;
          });
        }),
      );
    }

    if (this.tableConfig.hasRowDataElements()) {
      if (this.tableConfig.hasRowDescriptions()) await this.buildRowDescriptions();
      const rowDataElementCodes = this.tableConfig.rows.map(row => row.code);

      const { results } = await this.fetchAnalytics(rowDataElementCodes, {
        entityAggregation: {
          dataSourceEntityType: this.config.rowDataSourceEntityType,
        },
      });
      const rowsWithData = results.map(result => result.dataElement);

      if (this.tableConfig.hasRowDescriptions()) {
        this.tableConfig.rows
          .filter(row => rowsWithData.includes(row.code))
          .forEach(row => {
            this.rowsToDescriptions[row.name] =
              this.rowDescriptionResults[row.descriptionDataElement];
          });
      }
      this.tableConfig.rows = this.tableConfig.rows.filter(row => rowsWithData.includes(row.code));
    }

    return this.tableConfig.rows.map(dataElement => {
      const rowData = {
        dataElement: dataElement.hasOwnProperty('name') ? dataElement.name : dataElement,
      };
      const rowInfo = this.rowsToDescriptions && this.rowsToDescriptions[rowData.dataElement];
      if (rowInfo) return { ...rowData, rowInfo };

      return rowData;
    });
  }

  async buildRowDescriptions() {
    let rowDescriptionDataElementCodes = [];
    if (this.tableConfig.hasRowCategories()) {
      rowDescriptionDataElementCodes = flatten(
        this.tableConfig.rows.map(({ rows }) => rows.map(row => row.descriptionDataElement)),
      );
    } else {
      rowDescriptionDataElementCodes = this.tableConfig.rows.map(row => row.descriptionDataElement);
    }

    const { results: rowDescriptionResults } = await this.fetchAnalytics(
      rowDescriptionDataElementCodes,
    );

    this.rowDescriptionResults = reduceToDictionary(rowDescriptionResults, 'dataElement', 'value');
  }

  buildRowValues(rowIndex) {
    const values = {};
    Object.keys(this.tableConfig.cells[rowIndex]).forEach(columnIndex => {
      values[getColumnKey(columnIndex)] = this.calculateValue(rowIndex, columnIndex);
    });

    return values;
  }

  calculateValue(rowIndex, columnIndex) {
    const cell = this.tableConfig.cells[rowIndex][columnIndex];
    if (!cell) {
      return '';
    }

    return TotalCalculator.isTotalKey(cell)
      ? this.totalCalculator.calculate(rowIndex, columnIndex)
      : this.valuesByCell[this.getCellKey(rowIndex, columnIndex)];
  }

  getCellKey(rowIndex, columnIndex) {
    return this.tableConfig.cells[rowIndex][columnIndex];
  }

  async buildColumns() {
    const buildColumn = (column, index) => ({ key: getColumnKey(index), title: column });

    if (this.tableConfig.hasColumnMetadataTranslator()) {
      this.results = await this.tableConfig.processColumnMetadataTranslator(this.results);
    }

    if (this.tableConfig.columns === ORG_UNIT_COL_KEY) {
      this.buildOrgsFromResults();
    }

    if (this.tableConfig.columns === ORG_UNIT_WITH_TYPE_COL_KEY) {
      this.buildOrgsFromResultsWithCategories();
    }

    if (!this.hasColumnsInCategories(this.tableConfig.columns)) {
      return this.tableConfig.columns.map(buildColumn);
    }

    const categoryKeyToTitle = await this.getColumnCategoryToTitle();

    let index = 0;
    const builtColumns = this.tableConfig.columns.map(({ category, columns }) => ({
      category: categoryKeyToTitle(category),
      columns: columns.map(column => buildColumn(column, index++)),
    }));

    return builtColumns;
  }

  /**
   * Recursively builds an array of categories, including sub categories,
   * no matter how deeply they are nested.
   *
   * @param {Array} rows
   * @param {Array} categories
   */
  async buildRowCategories(rows = this.tableConfig.rows, categories = []) {
    if (rows.length === 0) return categories;
    const categoryToTitle = await this.getRowCategoryToTitle();

    const row = rows[0];
    const categoryName = row.category;

    if (row.rows) {
      const subCategories = row.rows
        .filter(r => typeof r !== 'string')
        .map(r => ({ ...r, parent: categoryName }));

      const category = { category: categoryToTitle(categoryName) };
      if (row.parent) category.categoryId = row.parent;
      return this.buildRowCategories(
        [...rows.slice(1), ...subCategories],
        [...categories, category],
      );
    }

    return this.buildRowCategories(rows.slice(1), [...categories]);
  }

  async getRowCategoryToTitle() {
    return this.tableConfig.hasOrgUnitRowCategories()
      ? this.getOrgUnitCategoryToTitle(this.tableConfig.rows)
      : key => key;
  }

  async getColumnCategoryToTitle() {
    return this.tableConfig.hasOrgUnitColumnCategories()
      ? this.getOrgUnitCategoryToTitle(this.tableConfig.columns)
      : key => key;
  }

  getOrgUnitCategoryToTitle = async dimension => {
    const orgUnitCodes = dimension.map(({ category }) => category);
    const orgUnits = await this.models.entity.find({ code: orgUnitCodes });
    const orgUnitCodeToName = reduceToDictionary(orgUnits, 'code', 'name');

    return code => orgUnitCodeToName[code];
  };

  buildOrgsFromResults() {
    const orgUnitCodes = reduceToSet(this.results, 'organisationUnit');
    this.tableConfig.columns = Array.from(orgUnitCodes).sort();
  }

  buildOrgsFromResultsWithCategories() {
    const types = reduceToDictionary(this.results, 'typeName', 'categoryCode');
    const sortedTypes = Object.keys(types).sort((a, b) => types[a] - types[b]);
    const orgUnitTypes = reduceToDictionary(this.results, 'organisationUnit', 'typeName');
    const columnCategories = new Map(sortedTypes.map(cat => [cat, []]));
    Object.keys(orgUnitTypes).forEach(org => {
      columnCategories.get(orgUnitTypes[org]).push(org);
    });
    const columns = [];
    columnCategories.forEach((cols, cat) => {
      columns.push({ category: cat, columns: cols });
    });
    this.tableConfig.columns = columns;
  }

  replaceOrgUnitCodesWithNames = async columns => {
    const orgUnitCodesToName = await this.fetchOrgUnitCodesToName(
      this.flattenColumnCategories(columns),
    );
    const swapNames = ({ title, key }) => ({ key, title: orgUnitCodesToName[title] });

    if (this.hasColumnsInCategories(columns)) {
      const updatedColumns = columns.map(category => {
        const newColumns = category.columns.map(swapNames);
        return { ...category, columns: newColumns };
      });
      return updatedColumns;
    }
    return columns.map(swapNames);
  };

  fetchOrgUnitCodesToName = async columns => {
    const orgUnitCodes = columns.map(c => c.title);
    const orgUnits = await this.models.entity.find({ code: orgUnitCodes });
    return reduceToDictionary(orgUnits, 'code', 'name');
  };

  flattenColumnCategories = columns => {
    return this.hasColumnsInCategories(columns)
      ? [].concat(...columns.map(categories => categories.columns))
      : columns;
  };

  hasColumnsInCategories = columns => {
    return columns[0] && columns[0].hasOwnProperty('category');
  };
}

export const tableOfDataValues = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new TableOfDataValuesBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.SUM_MOST_RECENT_PER_FACILITY,
  );
  return builder.build();
};
