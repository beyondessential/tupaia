/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { createDhisApi } from './helpers';

const DATA_ELEMENTS = [
  { code: 'POP01', id: 'pop01_dhisId' },
  { code: 'POP02', id: 'pop02_dhisId' },
];

export const testCodesToIds = () => {
  it('should return an empty array if no codes are provided', async () => {
    const dhisApi = createDhisApi();

    return Promise.all(
      [undefined, null, []].map(codes =>
        expect(dhisApi.codesToIds('dataElements', codes)).to.eventually.deep.equal([]),
      ),
    );
  });

  it('should translate codes to ids', async () => {
    const codes = DATA_ELEMENTS.map(({ code }) => code);
    const ids = DATA_ELEMENTS.map(({ id }) => id);
    const fetchStub = sinon.stub();
    fetchStub
      .withArgs('dataElements', {
        fields: sinon.match.array.contains(['id']),
        filter: { comparator: 'in', code: sinon.match.in(['[POP01,POP02]', '[POP02,POP01]']) },
      })
      .resolves({ dataElements: DATA_ELEMENTS.map(({ id, code }) => ({ id, code })) });

    const dhisApi = createDhisApi({ fetch: fetchStub });
    const results = await dhisApi.codesToIds('dataElements', codes);
    expect(results).to.deep.equal(ids);
  });
};
