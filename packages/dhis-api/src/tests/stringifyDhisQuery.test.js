/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import * as Dimensions from '../dimensions';
import { stringifyDhisQuery } from '../stringifyDhisQuery';

const DIMENSION = 'dimension';

describe('stringifyDhisQuery', () => {
  before(() => {
    sinon.stub(Dimensions, 'isDimension').callsFake(key => key === DIMENSION);
  });

  after(() => {
    Dimensions.isDimension.restore();
  });

  it('should stringify a query object with one entry', () => {
    expect(stringifyDhisQuery({ code: 'test' })).to.equal('?code=test');
  });

  it('should stringify a query object with multiple entries', () => {
    expect(stringifyDhisQuery({ id: 1, code: 'test' })).to.equal('?id=1&code=test');
  });

  it('should support query continuation', () => {
    expect(stringifyDhisQuery({ code: 'test' }, true)).to.equal('&code=test');
  });

  it('should do not use query continuation by default', () => {
    const query = { code: 'test' };
    expect(stringifyDhisQuery(query)).to.equal(stringifyDhisQuery(query, false));
  });

  it('should ignore undefined and null values', () => {
    expect(stringifyDhisQuery({ code: 'test', id: undefined })).to.equal('?code=test');
    expect(stringifyDhisQuery({ code: 'test', id: null })).to.equal('?code=test');
  });

  it('should stringify array values', () => {
    expect(stringifyDhisQuery({ dataElements: [1, 2] })).to.equal('?dataElements=1&dataElements=2');
  });

  it('should correctly stringify a "fields" array', () => {
    expect(stringifyDhisQuery({ fields: ['id', 'code'] })).to.equal('?fields=id,code');
  });

  it('should stringify a filter object containing one entry', () => {
    const query = {
      filter: { id: 'test' },
    };
    expect(stringifyDhisQuery(query)).to.equal('?filter=id:eq:test');
  });

  it('should stringify a filter object containing multiple entries', () => {
    const query = {
      filter: { id: 'testId', code: 'testCode' },
    };
    expect(stringifyDhisQuery(query)).to.equal('?filter=id:eq:testId&filter=code:eq:testCode');
  });

  it('should url encode the stringified a filter object', () => {
    const query = {
      filter: { id: 'a space' },
    };
    expect(stringifyDhisQuery(query)).to.equal('?filter=id:eq:a%20space');
  });

  it('should stringify a filter object containing a dimension key', () => {
    const query = {
      filter: { [DIMENSION]: 'testOu' },
    };
    expect(stringifyDhisQuery(query)).to.equal(`?${DIMENSION}=testOu`);
  });

  it('should stringify a filter object containing a comparator key', () => {
    const query = {
      filter: { id: 'testId', comparator: 'comp' },
    };
    expect(stringifyDhisQuery(query)).to.equal('?filter=id:comp:testId');
  });

  it('should stringify a "filter" array with a single element', () => {
    const query = {
      filter: [{ id: 'testId' }],
    };
    expect(stringifyDhisQuery(query)).to.equal('?filter=id:eq:testId');
  });

  it('should stringify a "filter" array with multiple elements', () => {
    const query = {
      filter: [{ id: 'testId' }, { code: 'testCode' }],
    };
    expect(stringifyDhisQuery(query)).to.equal('?filter=id:eq:testId&filter=code:eq:testCode');
  });

  it('should ignore an array of objects which is not a "filter" ', () => {
    const query = {
      noFilter: [{ id: 'testId' }],
    };
    expect(stringifyDhisQuery(query)).to.equal('');
  });

  it('should return an empty string for an empty input', () => {
    expect(stringifyDhisQuery({})).to.equal('');
  });

  it('should return an empty string for no valid values', () => {
    expect(stringifyDhisQuery({ code: undefined })).to.equal('');
    expect(stringifyDhisQuery({ code: null })).to.equal('');
  });
});
