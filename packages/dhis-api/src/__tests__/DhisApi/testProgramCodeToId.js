/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { createDhisApi } from './helpers';

const PROGRAM = { code: 'PROGRAM_CODE', id: 'program_dhisId' };

const fetchStub = sinon.stub();
fetchStub
  .resolves({ programs: [] })
  .withArgs('programs', {
    fields: sinon.match.array.contains(['id']),
    filter: { code: PROGRAM.code },
  })
  .resolves({ programs: [{ id: PROGRAM.id }] });

const dhisApi = createDhisApi({ fetch: fetchStub });

export const testProgramCodeToId = () => {
  it('non existing program', () => {
    expect(dhisApi.programCodeToId('NON_EXISTING_CODE')).to.eventually.be.rejectedWith(
      'Program not found',
    );
  });

  it('existing program', () =>
    expect(dhisApi.programCodeToId(PROGRAM.code)).to.eventually.equal(PROGRAM.id));
};
