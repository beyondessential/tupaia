/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import pickBy from 'lodash.pickby';
import xlsx from 'xlsx';

export class WorkBookParser {
  sheetNameFilter = null;

  /**
   * @param {Object<string, Function>} mappers
   * @param {Object<string, Function>} validators
   */
  constructor(mappers = {}, validators = {}) {
    this.mappers = mappers;
    this.validators = validators;
  }

  /**
   * @public
   * @param {string[]} sheetNameFilter
   */
  setSheetNameFilter(sheetNameFilter) {
    this.sheetNameFilter = sheetNameFilter;
  }

  /**
   * @public
   * @param {xlsx.workBook} workBook
   * @returns {Promise<Object<string, Object>>}
   */
  async parse(workBook) {
    const sheets = this.getSheetsToParse(workBook);

    const results = {};
    const addSheetToResults = async ([sheetName, sheet]) => {
      results[sheetName] = await this.parseSheet(sheetName, sheet);
    };
    await Promise.all(Object.entries(sheets).map(addSheetToResults));

    return results;
  }

  async parseSheet(sheetName, sheet) {
    const rows = this.getRowsInSheet(sheet);
    return Promise.all(rows.map(row => this.parseRow(row, sheetName)));
  }

  async parseRow(row, sheetName) {
    const validator = this.validators[sheetName];
    if (validator) {
      await validator(row);
    }

    const mapper = this.mappers[sheetName];
    return mapper ? mapper(row) : row;
  }

  getSheetsToParse(workBook) {
    const sheets = workBook.Sheets;
    if (!this.sheetNameFilter) {
      return sheets;
    }

    return pickBy(sheets, (sheet, sheetName) => this.sheetNameFilter.includes(sheetName));
  }

  getRowsInSheet = sheet => xlsx.utils.sheet_to_json(sheet);
}
