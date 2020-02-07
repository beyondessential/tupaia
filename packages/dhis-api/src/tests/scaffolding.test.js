/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import chai from 'chai';
import sinonChai from 'sinon-chai';

// These setup tasks need to be performed before any test, so we
// do them in this file outside of any describe block.

before(() => {
  chai.use(sinonChai);
});
