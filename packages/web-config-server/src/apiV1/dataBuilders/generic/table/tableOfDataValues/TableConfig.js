import { compareAsc } from '@tupaia/utils';
import { TotalCalculator } from './TotalCalculator';
import { uniq } from 'es-toolkit';

const METADATA_FIELDS = {
  $orgUnit: 'organisationUnit',
  $orgUnitTypeName: 'organisationUnit',
};

const METADATA_FIELD_TRANSLATORS = {
  $orgUnitTypeName: async (models, results) => {
    const orgUnitCodes = results.map(({ organisationUnit }) => organisationUnit);
    const facilities = await models.facility.find({ code: orgUnitCodes });
    const types = new Map(
      facilities.map(fac => [
        fac.code,
        { typeName: fac.type_name, categoryCode: fac.categoryCode },
      ]),
    );

    return results.map(res => {
      const fac = types.get(res.organisationUnit);
      const { typeName, categoryCode } = fac;
      return {
        ...res,
        typeName,
        categoryCode,
      };
    });
  },
};

const isMetadataKey = input => Object.keys(METADATA_FIELDS).includes(input);

const isMetadataTranslator = input => METADATA_FIELD_TRANSLATORS.hasOwnProperty(input);

export const addPrefixToCell = (cell, prefix) => `${prefix}_${cell}`;

/**
 * Represents the configuration that will be used to calculate the table values.
 */
export class TableConfig {
  rows = null;

  columns = null;

  cells = null;

  constructor(models, baseConfig, results) {
    this.models = models;
    this.baseConfig = baseConfig;
    this.generateTableFields(results);
  }

  generateTableFields(results) {
    this.rows = this.baseConfig.rows;
    this.columns = this.baseConfig.columns;
    this.cells = this.baseConfig.cells;
    // Sometimes columns is specified with a list orgUnits with a columnType like '$orgUnit'
    // Other times columns can be specified with variable e.g. '$orgUnit' and no columnType
    // columnType is used in build() to check whether codes should be converted to names
    // This is a bit of legacy debt that could do with refactor.
    this.columnType = this.baseConfig.columnType || this.columns;

    if (this.hasMetadataRowCategories()) {
      this.processRowMetadataFields(results);
    }
    if (this.hasMetadataColumnCategories()) {
      this.processColumnMetadataFields(results);
    }
  }

  getMetadataValues = (results, metadataField) =>
    uniq(results.map(({ [metadataField]: metadataValue }) => metadataValue)).sort(compareAsc);

  processRowMetadataFields(results) {
    const metadataValues = this.getMetadataValues(results, this.getRowMetadataField());
    const { rows } = this.baseConfig.rows[0];

    this.rows = metadataValues.map(value => ({ category: value, rows }));

    // TODO: flatMap()
    const cells = [];
    metadataValues.forEach(metadataValue => {
      const newCellRows = this.cells.map(cellRow =>
        cellRow.map(cell =>
          !cell || TotalCalculator.isTotalKey(cell) ? cell : addPrefixToCell(cell, metadataValue),
        ),
      );
      cells.push(...newCellRows);
    });
    this.cells = cells;
  }

  processColumnMetadataFields(results) {
    const metadataValues = this.getMetadataValues(results, this.getColumnMetadataField());
    const { columns } = this.baseConfig.columns[0];

    this.columns = metadataValues.map(value => ({ category: value, columns }));

    const cells = this.cells.map(cellRow => {
      const newCellRow = [];
      metadataValues.forEach(metadataValue => {
        const newCells = cellRow.map(cell => addPrefixToCell(cell, metadataValue));
        newCellRow.push(...newCells);
      });

      return newCellRow;
    });
    this.cells = cells;
  }

  async processColumnMetadataTranslator(results) {
    return this.getColumnMetadataTranslator()(this.models, results);
  }

  getColumnMetadataTranslator() {
    return METADATA_FIELD_TRANSLATORS[this.baseConfig.columns];
  }

  hasColumnMetadataTranslator() {
    return this.baseConfig.columns && isMetadataTranslator(this.baseConfig.columns);
  }

  hasMetadataCategories() {
    return this.hasMetadataRowCategories() || this.hasMetadataColumnCategories();
  }

  hasRowDataElements() {
    return (
      this.baseConfig.rows[0].hasOwnProperty('code') ||
      (this.baseConfig.rows[0].rows && this.baseConfig.rows[0].rows[0].hasOwnProperty('code'))
    );
  }

  hasRowDescriptions() {
    return (
      this.baseConfig.rows[0].hasOwnProperty('descriptionDataElement') ||
      (this.baseConfig.rows[0].rows &&
        this.baseConfig.rows[0].rows[0].hasOwnProperty('descriptionDataElement'))
    );
  }

  hasRowCategories() {
    return this.baseConfig.rows[0] && this.baseConfig.rows[0].category;
  }

  hasMetadataRowCategories() {
    return this.hasRowCategories() && isMetadataKey(this.baseConfig.rows[0].category);
  }

  hasOrgUnitRowCategories() {
    return this.hasRowCategories() && this.getRowMetadataField() === METADATA_FIELDS.$orgUnit;
  }

  getRowMetadataField() {
    return METADATA_FIELDS[this.baseConfig.rows[0].category];
  }

  hasColumnCategories() {
    return this.baseConfig.columns[0] && this.baseConfig.columns[0].category;
  }

  hasMetadataColumnCategories() {
    return this.hasColumnCategories() && isMetadataKey(this.baseConfig.columns[0].category);
  }

  hasOrgUnitColumnCategories() {
    return this.hasColumnCategories() && this.getColumnMetadataField() === METADATA_FIELDS.$orgUnit;
  }

  getColumnMetadataField() {
    return METADATA_FIELDS[this.baseConfig.columns[0].category];
  }
}
