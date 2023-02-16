/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ExpressionParser } from '@tupaia/expression-parser';

import { Context } from '../../context';
import { TransformTable } from '../table';
import { Row, FieldValue } from '../../types';
import {
  customFunctions,
  contextFunctions,
  functionExtensions,
  functionOverrides,
} from './functions';
import { TransformScope } from './TransformScope';

type RowLookup = {
  [key: string]: FieldValue[];
};

/**
 * Lookups object for rows within the transform data
 *
 * eg. if rows = [{BCD1: 5}, {BCD1: 8}, {BCD1: 4}], and currentRow = 1
 * '@current.BCD1' => 8
 * '@all.BCD1' => [5, 8, 4]
 * '@allPrevious.BCD1' => [5, 8]
 * 'where(f(@otherRow) = @otherRow.BCD1 < @current.BCD1).BCD1' => [5, 4]
 * '@current.BCD1 + sum(@allPrevious.BCD1)' => 21
 */
type Lookups = {
  params: Record<string, unknown>;
  current: Row;
  previous: Row;
  next: Row;
  all: RowLookup;
  allPrevious: RowLookup;
  index: number; // one-based index, this.currentRow + 1
  table: Row[];
};

export class TransformParser extends ExpressionParser {
  private static readonly EXPRESSION_PREFIX = '=';

  private currentRow = 0;
  private rows: Row[];
  private lookups: Lookups;
  // eslint-disable-next-line react/static-property-placement
  private context?: Context;

  public constructor(table: TransformTable = new TransformTable(), context?: Context) {
    super(new TransformScope());

    this.rows = table.getRows();
    this.lookups = {
      params: {},
      current: {},
      previous: {},
      next: {},
      all: {},
      allPrevious: {},
      index: this.currentRow + 1,
      table: this.rows,
    };

    if (context) {
      this.lookups.params = context.request?.query || {};
      this.set('@params', this.lookups.params);
    }

    if (this.rows.length > 0) {
      this.lookups.current = this.rows[this.currentRow];
      this.lookups.next = this.rows[this.currentRow + 1] || {};
      this.rows.forEach(row => addRowToLookup(row, this.lookups.all));
      addRowToLookup(this.lookups.current, this.lookups.allPrevious);
      this.addRowToScope(this.lookups.current);

      Object.entries(this.lookups).forEach(([lookupName, lookup]) => {
        this.set(`@${lookupName}`, lookup);
      });
      this.set('where', this.whereFunction); // no '@' prefix for where
    }

    this.context = context;
  }

  public static isExpression(input: unknown) {
    return typeof input === 'string' && input.startsWith(TransformParser.EXPRESSION_PREFIX);
  }

  protected readExpression(input: unknown) {
    return TransformParser.isExpression(input)
      ? (input as string).replace(new RegExp(`^${TransformParser.EXPRESSION_PREFIX}`), '')
      : input;
  }

  public evaluate(input: unknown) {
    return TransformParser.isExpression(input) ? super.evaluate(input) : input;
  }

  public next() {
    this.removeRowFromScope(this.lookups.current);

    this.currentRow++;

    if (this.currentRow >= this.rows.length) {
      return;
    }

    this.lookups.previous = this.rows[this.currentRow - 1];
    this.lookups.next = this.rows[this.currentRow + 1] || {};
    this.lookups.current = this.rows[this.currentRow];
    this.lookups.index = this.currentRow + 1;
    this.set('@previous', this.lookups.previous);
    this.set('@next', this.lookups.next);
    this.set('@current', this.lookups.current);
    this.set('@index', this.lookups.index);
    addRowToLookup(this.lookups.current, this.lookups.allPrevious);
    this.addRowToScope(this.lookups.current);
  }

  public addRowToScope = (row: Row) => {
    Object.entries(row).forEach(([field, value]) => {
      if (value !== undefined && value !== null && !field.includes(' ')) {
        this.set(`$${field}`, value);
      }
    });
  };

  public removeRowFromScope = (row: Row) => {
    Object.keys(row).forEach(field => {
      this.delete(`$${field}`);
    });
  };

  private whereFunction = (check: (row: Row) => boolean) => {
    const whereData = {};
    const filteredRows = this.rows.filter(rowInFilter => check(rowInFilter));
    filteredRows.forEach(row => {
      addRowToLookup(row, whereData);
    });
    return whereData;
  };

  protected getCustomFunctions() {
    const { functions: factoryFunctions, dependencies } = this.buildFactoryFunctions();

    return {
      ...super.getCustomFunctions(),
      ...customFunctions,
      ...factoryFunctions,
      ...dependencies,
    };
  }

  protected getFunctionExtensions() {
    return { ...super.getFunctionExtensions(), ...functionExtensions };
  }

  protected getFunctionOverrides() {
    return { ...super.getFunctionOverrides(), ...functionOverrides };
  }

  private buildFactoryFunctions() {
    const dependencies = {
      getContext: () => this.context,
    };

    const functions = Object.fromEntries(
      Object.entries(contextFunctions).map(([fnName, fn]) => [
        fnName,
        this.factory(fnName, ['getContext'], fn),
      ]),
    );

    return { functions, dependencies };
  }
}

const addRowToLookup = (row: Row, lookup: RowLookup) => {
  Object.entries(row).forEach(([field, value]) => {
    if (value !== undefined && value !== null) {
      if (!(field in lookup)) {
        // eslint-disable-next-line no-param-reassign
        lookup[field] = [];
      }
      lookup[field].push(value);
    }
  });
};
