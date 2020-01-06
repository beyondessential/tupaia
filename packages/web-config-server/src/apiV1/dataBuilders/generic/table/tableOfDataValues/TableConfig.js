/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

const METADATA_FIELDS = {
  $orgUnit: 'organisationUnit',
};

const isMetadataKey = input => Object.keys(METADATA_FIELDS).includes(input);

export const addPrefixToCell = (cell, prefix) => `${prefix}_${cell}`;

/**
 * Represents the configuration that will be used to calculate the table values.
 */
export class TableConfig {
  rows = null;

  columns = null;

  cells = null;

  constructor(baseConfig, results) {
    this.baseConfig = baseConfig;
    this.generateTableFields(results);
  }

  generateTableFields(results) {
    this.rows = this.baseConfig.rows;
    this.columns = this.baseConfig.columns;
    this.cells = this.baseConfig.cells;

    if (this.hasMetadataRowCategories()) {
      this.processRowMetadataFields(results);
    }
    if (this.hasMetadataColumnCategories()) {
      this.processColumnMetadataFields(results);
    }
  }

  getMetadataValues = (results, metadataField) =>
    [...new Set(results.map(({ [metadataField]: metadataValue }) => metadataValue))].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );

  processRowMetadataFields(results) {
    const metadataValues = this.getMetadataValues(results, this.getRowMetadataField());
    const { rows } = this.baseConfig.rows[0];

    this.rows = metadataValues.map(value => ({ category: value, rows }));

    const cells = [];
    metadataValues.forEach(metadataValue => {
      const newCellRows = this.cells.map(cellRow =>
        cellRow.map(cell => addPrefixToCell(cell, metadataValue)),
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

  hasMetadataCategories() {
    return this.hasMetadataRowCategories() || this.hasMetadataColumnCategories();
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
