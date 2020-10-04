/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { removeArrayValue, replaceArrayValue, updateValues } from '../../utilities/migration';

chai.use(chaiAsPromised);

const dbStub = {
  runSql: (query, replacementParams) => ({ query, replacementParams }),
};

describe('migrationUtilities', () => {
  describe('updateValues', () => {
    it('should require a db parameter', () =>
      expect(updateValues()).to.be.rejectedWith('db is a required parameter'));

    it('should require a table parameter', () =>
      expect(updateValues('db')).to.be.rejectedWith('table is a required parameter'));

    it('should require a newValues parameter', () =>
      expect(updateValues('db', 'table')).to.be.rejectedWith('newValues is a required parameter'));

    it('should require a condition parameter', () =>
      expect(updateValues('db', 'table', 'newValues')).to.be.rejectedWith(
        'condition is a required parameter',
      ));

    it('should use replacement values to construct the query for one new value', () =>
      expect(updateValues(dbStub, 'table', { column: 0 }, 'condition')).to.eventually.have.property(
        'query',
        'UPDATE "table" SET "column" = ? WHERE condition',
      ));

    it('should use replacement values to construct the query for multiple new values', () =>
      expect(
        updateValues(dbStub, 'table', { column1: 0, column2: 1 }, 'condition'),
      ).to.eventually.have.property(
        'query',
        'UPDATE "table" SET "column1" = ?, "column2" = ? WHERE condition',
      ));

    it('should accept a string as the condition', () =>
      expect(updateValues(dbStub, 'table', { column: 0 }, 'condition')).to.eventually.have.property(
        'query',
        'UPDATE "table" SET "column" = ? WHERE condition',
      ));

    it('should accept an object as the condition', () =>
      expect(
        updateValues(dbStub, 'table', { column: 0 }, { conditionColumn: 1 }),
      ).to.eventually.have.property(
        'query',
        'UPDATE "table" SET "column" = ? WHERE "conditionColumn" = ?',
      ));

    it('should be able to update multiple values', async () =>
      expect(
        updateValues(dbStub, 'table', { column1: 0, column2: 1 }, 'condition'),
      ).to.eventually.have.deep.property('replacementParams', [0, 1]));

    it('should accept multiple conditions', async () =>
      expect(
        updateValues(dbStub, 'table', { column: 0 }, { conditionColumn1: 1, conditionColumn2: 2 }),
      ).to.eventually.have.deep.property('replacementParams', [0, 1, 2]));

    it('should update a column value to a number', () =>
      expect(
        updateValues(dbStub, 'table', { column: 0 }, 'condition'),
      ).to.eventually.have.deep.property('replacementParams', [0]));

    it('should update a column value to a string', () =>
      expect(
        updateValues(dbStub, 'table', { column: 'string' }, 'condition'),
      ).to.eventually.have.deep.property('replacementParams', ['string']));

    it('should update a column value to a boolean', () =>
      expect(
        updateValues(dbStub, 'table', { column: false }, 'condition'),
      ).to.eventually.have.deep.property('replacementParams', [false]));

    it('should update a column value to an object', async () => {
      const object = {
        a: 1,
        b: true,
        c: 'string',
        d: {
          key: 'value',
        },
      };

      expect(
        updateValues(dbStub, 'table', { column: object }, 'condition'),
      ).to.eventually.have.deep.property('replacementParams', [object]);
    });
  });

  describe('removeArrayValue', () => {
    it('should require a db parameter', () =>
      expect(removeArrayValue()).to.be.rejectedWith('db is a required parameter'));

    it('should require a table parameter', () =>
      expect(removeArrayValue('db')).to.be.rejectedWith('table is a required parameter'));

    it('should require a column parameter', () =>
      expect(removeArrayValue('db', 'table')).to.be.rejectedWith('column is a required parameter'));

    it('should require a value parameter', () =>
      expect(removeArrayValue('db', 'table', 'column')).to.be.rejectedWith(
        'value is a required parameter',
      ));

    it('should require a condition parameter', () =>
      expect(removeArrayValue('db', 'table', 'column', 'value')).to.be.rejectedWith(
        'condition is a required parameter',
      ));

    it('should use replacement values to construct the query', () =>
      expect(
        removeArrayValue(dbStub, 'table', 'column', 0, 'condition'),
      ).to.eventually.have.property(
        'query',
        'UPDATE "table" SET "column" = array_remove("column", ?) WHERE condition',
      ));

    it('should remove a number value', () =>
      expect(
        removeArrayValue(dbStub, 'table', 'column', 0, 'condition'),
      ).to.eventually.have.deep.property('replacementParams', [0]));

    it('should remove a string value', () =>
      expect(
        removeArrayValue(dbStub, 'table', 'column', 'string', 'condition'),
      ).to.eventually.have.deep.property('replacementParams', ['string']));

    it('should remove a boolean value', () =>
      expect(
        removeArrayValue(dbStub, 'table', 'column', false, 'condition'),
      ).to.eventually.have.deep.property('replacementParams', [false]));

    it('should remove an object value', async () => {
      const object = {
        a: 1,
        b: true,
        c: 'string',
        d: {
          key: 'value',
        },
      };

      expect(
        removeArrayValue(dbStub, 'table', 'column', object, 'condition'),
      ).to.eventually.have.deep.property('replacementParams', [object]);
    });
  });

  describe('replaceArrayValue', () => {
    it('should require a db parameter', () =>
      expect(replaceArrayValue()).to.be.rejectedWith('db is a required parameter'));

    it('should require a table parameter', () =>
      expect(replaceArrayValue('db')).to.be.rejectedWith('table is a required parameter'));

    it('should require a column parameter', () =>
      expect(replaceArrayValue('db', 'table')).to.be.rejectedWith(
        'column is a required parameter',
      ));

    it('should require a oldValue parameter', () =>
      expect(replaceArrayValue('db', 'table', 'column')).to.be.rejectedWith(
        'oldValue is a required parameter',
      ));

    it('should require a newValueInput parameter', () =>
      expect(replaceArrayValue('db', 'table', 'column', 'oldValue')).to.be.rejectedWith(
        'newValueInput is a required parameter',
      ));

    it('should require a condition parameter', () =>
      expect(
        replaceArrayValue('db', 'table', 'column', 'oldValue', 'newValueInput'),
      ).to.be.rejectedWith('condition is a required parameter'));

    it('should allow a single value to be provided as newValueInput', async () =>
      expect(
        replaceArrayValue(dbStub, 'table', 'column', 0, 1, 'condition'),
      ).to.eventually.have.deep.property('replacementParams', [0, 1]));

    it('should allow multiple values to be provided as newValueInput', async () =>
      expect(
        replaceArrayValue(dbStub, 'table', 'column', 0, [1, 2], 'condition'),
      ).to.eventually.have.deep.property('replacementParams', [0, 1, 2]));

    it('should use replacement values to construct the query for one new value', () =>
      expect(
        replaceArrayValue(dbStub, 'table', 'column', 0, 1, 'condition'),
      ).to.eventually.have.property(
        'query',
        `UPDATE "table" SET "column" = array_remove("column", ?) || ARRAY[?] WHERE condition`,
      ));

    it('should use replacement values to construct the query for multiple new values', () =>
      expect(
        replaceArrayValue(dbStub, 'table', 'column', 0, [1, 1], 'condition'),
      ).to.eventually.have.property(
        'query',
        `UPDATE "table" SET "column" = array_remove("column", ?) || ARRAY[?,?] WHERE condition`,
      ));

    it('should replace a number value', () =>
      expect(
        replaceArrayValue(dbStub, 'table', 'column', 0, 1, 'condition'),
      ).to.eventually.have.deep.property('replacementParams', [0, 1]));

    it('should replace a string value', () =>
      expect(
        replaceArrayValue(dbStub, 'table', 'column', 'oldString', 'newString', 'condition'),
      ).to.eventually.have.deep.property('replacementParams', ['oldString', 'newString']));

    it('should replace a boolean value', () =>
      expect(
        replaceArrayValue(dbStub, 'table', 'column', false, true, 'condition'),
      ).to.eventually.have.deep.property('replacementParams', [false, true]));

    it('should replace an object value', async () => {
      const oldObject = {
        a: 1,
        b: true,
        c: 'string',
        d: {
          key: 'value',
        },
      };
      const newObject = {
        a: 2,
      };

      expect(
        replaceArrayValue(dbStub, 'table', 'column', oldObject, newObject, 'condition'),
      ).to.eventually.have.deep.property('replacementParams', [oldObject, newObject]);
    });
  });
});
